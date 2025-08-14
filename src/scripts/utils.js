import CONSTANTS from "./constants.js";
import Logger from "./logger.js";

/**
 * Reusable utility functions
 */
export class Utils {
    /**
     * Convert seconds into milliseconds
     * @param {number} seconds The seconds
     * @returns {number}       The milliseconds
     */
    static convertSecondsToMilliseconds(seconds) {
        if (!seconds) return 0;
        return seconds * 1000;
    }

    /**
     * Get the first image source from a journal page
     * @param {object} page The page
     * @returns {string}    The image source
     */
    static getFirstImageFromPage(page) {
        const content = page?.text?.content;
        if (!content) return null;
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");
        const imgElement = doc.querySelector("img");
        if (!imgElement) return null;
        const src = imgElement.getAttribute("src");
        return src || null;
    }

    /**
     * Get text including HTML tags from a journal page
     * @param {object} page The page
     * @returns {string}    The text
     */
    static getTextFromPage(page) {
        const content = page?.text?.content;
        if (!content) return null;
        const textTags = ["BLOCKQUOTE", "CODE", "H1", "H2", "H3", "H4", "H5", "H6", "P"];
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");
        const tags = Array.from(doc.body.children);
        const filteredTags = tags.filter((tag) => textTags.includes(tag.tagName));
        const text = filteredTags.map((tag) => tag.outerHTML).join("");
        return text || null;
    }

    /**
     * Preload video metadata
     * @param {string} src The video source
     * @returns {object}   The video
     */
    static async preloadVideoMetadata(src) {
        return new Promise((resolve, reject) => {
            try {
                const video = document.createElement("video");
                video.setAttribute("src", src);
                video.preload = "metadata";

                video.onloadedmetadata = function () {
                    resolve(this);
                };

                video.onerror = function () {
                    reject("Invalid video. Please select a video file.");
                };

                return video;
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Get video duration from metadata
     * @param {string} src The video source
     * @returns {number}   The duration in milliseconds
     */
    static async getVideoDuration(src) {
        const video = await this.preloadVideoMetadata(src);
        return this.convertSecondsToMilliseconds(video.duration);
    }

    /**
     * Get the video type
     * @param {*} src    The source
     * @returns {string} The video type
     */
    static getVideoType(src) {
        if (src.endsWith("webm")) {
            return "video/webm";
        } else if (src.endsWith("mp4")) {
            return "video/mp4";
        }
        return "video/mp4";
    }

    /**
     * Get module setting
     * @param {string} key          The key
     * @param {string} defaultValue The default value
     * @returns {*}                 The setting
     */
    static getSetting(key, defaultValue = null) {
        let value = defaultValue ?? null;
        try {
            value = game.settings.get(CONSTANTS.MODULE.ID, key);
        } catch {
            Logger.debug(`Setting '${key}' not found`);
        }
        return value;
    }

    /**
     * Set module setting
     * @param {string} key The key
     * @param {*} value    The value
     */
    static async setSetting(key, value) {
        if (game.settings.settings.get(`${CONSTANTS.MODULE.ID}.${key}`)) {
            await game.settings.set(CONSTANTS.MODULE.ID, key, value);
            Logger.debug(`Setting '${key}' set to '${value}'`);
        } else {
            Logger.debug(`Setting '${key}' not found`);
        }
    }

    /**
     * Whether the value is a boolean
     * @param {*} value   The value
     * @returns {boolean} Whether the value is a boolean
     */
    static isBoolean(value) {
        if (String(value) === "true" || String(value) === "false") {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Whether the file is a video
     * @param {string} src The source
     * @returns {boolean}  Whether the file is a video
     */
    static isVideo(src) {
        const re = /(?:\.([^.]+))?$/;
        const ext = re.exec(src)?.[1];
        return ext === "webm" || ext === "mp4";
    }

    static stripQueryStringAndHashFromPath(url) {
        let myUrl = url;
        if (!myUrl) {
            return myUrl;
        }
        if (myUrl.includes("?")) {
            myUrl = myUrl.split("?")[0];
        }
        if (myUrl.includes("#")) {
            myUrl = myUrl.split("#")[0];
        }
        return myUrl;
    }

    static retrieveFirstImageFromJournalId(id, pageId, noDefault) {
        const journalEntry = game.journal.get(id);
        let firstImage = undefined;
        if (!journalEntry) {
            return firstImage;
        }
        // Support old data image
        // if (journalEntry?.data?.img) {
        // 	return stripQueryStringAndHashFromPath(journalEntry?.data?.img);
        // }
        // Support new image type journal
        if (journalEntry?.pages.size > 0) {
            const sortedArray = journalEntry.pages.contents.sort((a, b) => a.sort - b.sort);
            if (pageId) {
                const pageSelected = sortedArray.find((page) => page.id === pageId);
                if (pageSelected) {
                    if (pageSelected.type === "image" && pageSelected.src) {
                        firstImage = stripQueryStringAndHashFromPath(pageSelected.src);
                    }
                    // this should manage all MJE type
                    else if (pageSelected.src) {
                        firstImage = stripQueryStringAndHashFromPath(pageSelected.src);
                    }
                }
            }
            // const shouldCheckForDefault = !noDefault && pageId?.length > 0;
            if (!noDefault && !firstImage) {
                for (const pageEntry of sortedArray) {
                    if (pageEntry.type === "image" && pageEntry.src) {
                        firstImage = stripQueryStringAndHashFromPath(pageEntry.src);
                        break;
                    } else if (pageEntry.src && pageEntry.type === "pdf") {
                        firstImage = stripQueryStringAndHashFromPath(pageEntry.src);
                        break;
                    }
                    // this should manage all MJE type
                    else if (pageEntry.src) {
                        firstImage = stripQueryStringAndHashFromPath(pageEntry.src);
                        break;
                    }
                }
            }
        }
        return firstImage;
    }

    static retrieveFirstTextFromJournalId(id, pageId, noDefault) {
        const journalEntry = game.journal.get(id);
        let firstText = undefined;
        if (!journalEntry) {
            return firstText;
        }
        // Support old data image
        // if (journalEntry?.data?.img) {
        // 	return stripQueryStringAndHashFromPath(journalEntry?.data?.img);
        // }
        // Support new image type journal
        if (journalEntry?.pages.size > 0) {
            const sortedArray = journalEntry.pages.contents.sort((a, b) => a.sort - b.sort);
            if (pageId) {
                const pageSelected = sortedArray.find((page) => page.id === pageId);
                if (pageSelected) {
                    if (pageSelected.type === "text" && pageSelected.text?.content) {
                        firstText = pageSelected.text?.content;
                    }
                    // this should manage all MJE type
                    else if (pageSelected.text?.content) {
                        firstText = pageSelected.text?.content;
                    }
                }
            }
            // const shouldCheckForDefault = !noDefault && pageId?.length > 0;
            if (!noDefault && !firstText) {
                for (const journalEntry of sortedArray) {
                    if (journalEntry.type === "text" && journalEntry.text?.content) {
                        firstText = journalEntry.text?.content;
                        break;
                    }
                    // this should manage all MJE type
                    else if (journalEntry.text?.content) {
                        firstText = journalEntry.text?.content;
                        break;
                    }
                }
            }
        }
        return firstText;
    }
}
