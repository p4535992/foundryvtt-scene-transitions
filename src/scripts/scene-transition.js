import CONSTANTS from "./constants.js";
import Logger from "./logger.js";
import { SceneTransitionOptions } from "./scene-transition-options.js";
import EditTransitionForm from "./forms/edit-transition-form.js";
import { registerSocket } from "./socket.js";
import { sceneTransitionsSocket } from "./socket.js";
import { Utils } from "./utils.js";

export class SceneTransition {
    /**
     *
     * @param {boolean} preview
     * @param {object} options: v0.1.1 options go here. Previously sceneID
     */
    constructor(preview, options = {}) {
        this.preview = preview;
        this.options = foundry.utils.mergeObject(this.constructor.defaultOptions, options);
        this.journal = null;
        this.element = null;
        this.destroying = false;
        this.audio = null; //new Sound("");
    }

    static get defaultOptions() {
        const defaultSettings = Utils.getSetting(CONSTANTS.SETTING.DEFAULT_OPTIONS) || {};
        return new SceneTransitionOptions(defaultSettings);
    }

    /********************
     * Button functions for Foundry menus and window headers
     *******************/
    /**
     * Handles the renderSceneConfig Hook
     *
     * Injects HTML into the scene config.
     *
     * @static
     * @param {SceneConfig} sceneConfig - The Scene config sheet
     * @param {jQuery} html - The HTML of the sheet
     * @param {object} data - Data associated with the sheet rendering
     * @memberof PinFixer
     */
    static async renderSceneConfig(sceneConfig, html, data) {
        const ambItem = html.find(".item[data-tab=ambience]");
        const ambTab = html.find(".tab[data-tab=ambience]");

        ambItem.after(`<a class="item" data-tab="scene-transitions">
		<i class="fas fa-bookmark"></i> ${game.i18n.localize(`${CONSTANTS.MODULE.ID}.scene.config.title`)}</a>`);
        ambTab.after(await this.getSceneHtml(this.getSceneTemplateData(data)));
        this.attachEventListeners(html);
    }

    /**
     * The HTML to be added to the scene configuration
     * in order to configure Pin Fixer for the scene.
     * @param {PinFixSettings} settings - The Pin Fixer settings of the scene being configured.
     * @static
     * @return {string} The HTML to be injected
     * @memberof PinFixer
     */
    static async getSceneHtml(settings) {
        return await renderTemplate(CONSTANTS.TEMPLATE.EDIT_TRANSITION_FORM, settings);
    }

    /**
     * Retrieves the current data for the scene being configured.
     *
     * @static
     * @param {object} data - The data being passed to the scene config template
     * @return {PinFixSettings}
     * @memberof PinFixer
     */
    static getSceneTemplateData(hookData) {
        let data = getProperty(hookData.data?.flags[CONSTANTS.MODULE.ID], "transition.options");

        if (!data) {
            const defaultSettings = Utils.getSetting(CONSTANTS.SETTING.DEFAULT_OPTIONS) || {};
            data = foundry.utils.mergeObject(defaultSettings, CONSTANTS.DEFAULT_SETTING);
        }

        return data;
    }

    static addPlayTransitionBtn() {
        return {
            name: game.i18n.localize(`${CONSTANTS.MODULE.ID}.label.playTransition`),
            icon: '<i class="fas fa-play-circle"></i>',
            condition: (li) => {
                const sceneID = $(li).data("sceneId") || $(li).data("entryId") || $(li).data("documentId");
                const scene = game.scenes?.get(sceneID);
                const hasTransition = scene && typeof scene.getFlag(CONSTANTS.MODULE.ID, "transition") == "object";
                if (game.user?.isGM && hasTransition) {
                    return true;
                } else {
                    return false;
                }
            },
            callback: (li) => {
                const sceneID = $(li).data("sceneId") || $(li).data("entryId") || $(li).data("documentId");
                game.scenes?.preload(sceneID, true);
                const scene = game.scenes?.get(sceneID);
                //@ts-ignore
                let transition = scene.getFlag(CONSTANTS.MODULE.ID, "transition");
                let options = transition.options;
                options.sceneID = sceneID;
                options = {
                    ...options,
                    fromSocket: true,
                };
                if (!sceneTransitionsSocket) {
                    registerSocket();
                }
                sceneTransitionsSocket.executeForEveryone("executeAction", options);
            },
        };
    }

    static addCreateTransitionBtn() {
        return {
            name: "Create Transition",
            icon: '<i class="fas fa-plus-square"></i>',
            condition: (li) => {
                const sceneID = $(li).data("sceneId") || $(li).data("entryId") || $(li).data("documentId");
                const scene = game.scenes?.get(sceneID);
                const hasNoTransition = scene && !scene.getFlag(CONSTANTS.MODULE.ID, "transition");
                if (game.user?.isGM && hasNoTransition) {
                    return true;
                } else {
                    return false;
                }
            },
            callback: (li) => {
                let sceneID = $(li).data("sceneId") || $(li).data("entryId") || $(li).data("documentId");
                let options = {
                    sceneID: sceneID,
                };
                let activeTransition = new SceneTransition(true, options, undefined);
                activeTransition.render();
                new EditTransitionForm(activeTransition, undefined).render(true);
            },
        };
    }

    static addEditTransitionBtn() {
        return {
            name: "Edit Transition",
            icon: '<i class="fas fa-edit"></i>',
            condition: (li) => {
                const sceneID = $(li).data("sceneId") || $(li).data("entryId") || $(li).data("documentId");
                const scene = game.scenes?.get(sceneID);
                const hasTransition = scene && scene.getFlag(CONSTANTS.MODULE.ID, "transition");
                if (game.user?.isGM && hasTransition) {
                    return true;
                } else {
                    return false;
                }
            },
            callback: (li) => {
                let scene = game.scenes?.get(
                    $(li).data("sceneId") || $(li).data("entryId") || $(li).data("documentId"),
                );
                let transition = scene.getFlag(CONSTANTS.MODULE.ID, "transition");
                let activeTransition = new SceneTransition(true, transition.options, undefined);
                activeTransition.render();
                new EditTransitionForm(activeTransition, undefined).render(true);
            },
        };
    }

    static addDeleteTransitionBtn() {
        return {
            name: game.i18n.localize(`${CONSTANTS.MODULE.ID}.label.deleteTransition`),
            icon: '<i class="fas fa-trash-alt"></i>',
            condition: (li) => {
                const sceneID = $(li).data("sceneId") || $(li).data("entryId") || $(li).data("documentId");
                const scene = game.scenes?.get(sceneID);
                const hasTransition = scene && scene.getFlag(CONSTANTS.MODULE.ID, "transition");
                if (game.user?.isGM && hasTransition) {
                    return true;
                } else {
                    return false;
                }
            },
            callback: (li) => {
                let scene = game.scenes?.get(
                    $(li).data("sceneId") || $(li).data("entryId") || $(li).data("documentId"),
                );
                scene.unsetFlag(CONSTANTS.MODULE.ID, "transition");
            },
        };
    }

    static addPlayTransitionBtnJE() {
        return {
            name: game.i18n.localize(`${CONSTANTS.MODULE.ID}.label.playTransitionFromJournal`),
            icon: '<i class="fas fa-play-circle"></i>',
            condition: (li) => {
                if (game.user?.isGM) {
                    return true;
                } else {
                    return false;
                }
            },
            callback: (li) => {
                let journalID = $(li).data("entryId") || $(li).data("documentId");
                let journal = game.journal?.get(journalID);
                if (!journal) {
                    Logger.warn(`No journal is found`);
                    return;
                }

                const pages = journal.pages.contents;
                if (!pages || pages.length === 0) {
                    Logger.warn(`No pages found in journal`);
                    return;
                }

                // If there's only one page, use it directly
                if (pages.length === 1) {
                    SceneTransition.playTransitionFromPage(pages[0]);
                    return;
                }

                // If there are multiple pages, show a selection dialog
                SceneTransition.showPageSelectionDialog(journal, pages);
            },
        };
    }

    static addPlayTransitionBtnJEPage() {
        return {
            name: game.i18n.localize(`${CONSTANTS.MODULE.ID}.label.playTransitionFromJournal`),
            icon: '<i class="fas fa-play-circle"></i>',
            condition: (li) => {
                if (game.user?.isGM) {
                    return true;
                } else {
                    return false;
                }
            },
            callback: (li) => {
                // For individual journal pages, we need to get the page directly
                let pageID = $(li).data("entryId") || $(li).data("documentId") || $(li).data("pageId");
                let page = null;
                
                // Try to find the page in all journals
                for (let journal of game.journal) {
                    page = journal.pages.get(pageID);
                    if (page) break;
                }
                
                if (!page) {
                    Logger.warn(`No journal page found with ID: ${pageID}`);
                    return;
                }

                SceneTransition.playTransitionFromPage(page);
            },
        };
    }

    /**
     * Show a dialog to select which page to use for the transition
     * @param {JournalEntry} journal The journal entry
     * @param {JournalEntryPage[]} pages The available pages
     */
    static async showPageSelectionDialog(journal, pages) {
        const pageOptions = pages.map(page => {
            const typeIcon = {
                text: "fas fa-file-text",
                image: "fas fa-image", 
                video: "fas fa-video"
            }[page.type] || "fas fa-file";
            
            return `<option value="${page.id}">
                <i class="${typeIcon}"></i> ${page.name} (${page.type})
            </option>`;
        }).join("");

        const content = `
            <form>
                <div class="form-group">
                    <label>Select a page to use for the transition:</label>
                    <select name="pageId" style="width: 100%;">
                        ${pageOptions}
                    </select>
                </div>
            </form>
        `;

        const selectedPageId = await Dialog.prompt({
            title: `Select Page from "${journal.name}"`,
            content: content,
            callback: (html) => {
                return html.find('[name="pageId"]').val();
            },
            rejectClose: false
        });

        if (selectedPageId) {
            const selectedPage = pages.find(p => p.id === selectedPageId);
            if (selectedPage) {
                SceneTransition.playTransitionFromPage(selectedPage);
            }
        }
    }

    /**
     * Play a transition from a specific journal page
     * @param {JournalEntryPage} page The journal page
     */
    static playTransitionFromPage(page) {
        let content = null;
        let bgImg = null;
        let bgLoop = null;
        let volume = null;

        switch (page.type) {
            case "image":
                bgImg = page.src;
                break;
            case "text":
                content = Utils.getTextFromPage(page);
                bgImg = Utils.getFirstImageFromPage(page);
                break;
            case "video":
                bgImg = page.src;
                bgLoop = page.video.loop;
                volume = page.video.volume;
                break;
            default:
                Logger.warn(`Unsupported page type: ${page.type}`);
                return;
        }

        const options = new SceneTransitionOptions({ content, bgImg, bgLoop });
        sceneTransitionsSocket.executeForEveryone("executeAction", options);
    }

    /**
     * Render the transition
     */
    async render() {
        SceneTransition.activeTransition = this;

        if (this.options.gmHide && game.user?.isGM) {
            Logger.info(`Option 'gmHide' is true and you are a GM so you don't see the transition`);
            return;
        }

        await this.#buildOptions();
        await this.#buildTransition();
    }

    /**
     * Build options
     */
    async #buildOptions() {
        this.options.showCloseButton = game.user?.isGM || this.options.allowPlayersToEnd;
        this.options.isVideo = Utils.isVideo(this.options.bgImg);
        this.options.zIndex = game.user?.isGM || this.options.showUI ? 1 : 5000;

        if (this.options.isVideo) {
            this.options.sourceType = Utils.getVideoType(this.options.bgImg);
            this.options.delay = await Utils.getVideoDuration(this.options.bgImg);
        }
    }

    /**
     * Build transition
     */
    async #buildTransition() {
        // Destroy existing scene transition
        if (this.element) {
            this.destroy(true);
        }

        // Build new scene transition
        const template = await renderTemplate(CONSTANTS.TEMPLATE.SCENE_TRANSITION, this.options);
        document.body.insertAdjacentHTML("beforeend", template);

        this.element = document.body.querySelector("#scene-transitions");

        this.#addCloseEvent();

        if (this.options.audio) {
            this.playAudio();
        }

        this.#executeFadeIn();
    }

    /**
     * Add on click event listener to the Close button
     */
    #addCloseEvent() {
        const closeButton = this.element.querySelector("#scene-transitions-close-button");

        if (!closeButton) return;

        const onClick = () => {
            if (game.user.isGM && this.options.gmEndAll) {
                let options = new SceneTransitionOptions({ action: "end" });
                options.fromSocket = true;

                if (!sceneTransitionsSocket) {
                    registerSocket();
                }

                sceneTransitionsSocket.executeForEveryone("executeAction", options);
            }

            this.destroy();
        };

        $(closeButton).on("click", onClick);
    }

    /**
     * Play the audio
     * @private
     */
    playAudio(src = this.options.audio, volume = this.options.volume, loop = this.options.audioLoop) {
        if (game.audio.locked) {
            Logger.info("Audio playback locked, cannot play " + this.options.audio);
        } else {
            let thisTransition = this;

            if (this.audio?.playing) {
                this.audio.stop();
            }

            this.audio = null;

            AudioHelper.play(
                {
                    src,
                    volume,
                    loop: String(loop) === "true" ? true : false,
                },
                false,
            ).then(function (audio) {
                //audio.on("start", (a) => {});
                audio.on("stop", (a) => {});
                audio.on("end", (a) => {});
                thisTransition.audio = audio; // a ref for fading later
            });
        }
    }

    /**
     * Execute the fade in of the main element
     * @private
     */
    #executeFadeIn() {
        const contentElement = this.element.querySelector(".scene-transitions-content");

        const activateScene = () => {
            if (!this.options.preview) {
                const scene = game.scenes?.get(this.options.sceneID);

                if (game.user?.isGM && !scene) {
                    Logger.info(`The scene has not been activated as scene [${this.options.sceneID}] was not found`);
                    return;
                }

                // Only activate scene if the activateScene option is enabled
                if (this.options.activateScene) {
                    if (game.user?.isGM) {
                        scene.activate();
                    } else {
                        scene.view();
                    }
                }
            }
        };

        $(contentElement).fadeIn();

        this.setDelay();

        $(this.element).fadeIn(this.options.fadeIn, activateScene);
    }

    /**
     * Set delay before fading out the transition
     */
    setDelay() {
        if (!this.options.delay) return;

        this.timeout = setTimeout(
            function () {
                this.destroy();
            }.bind(this),
            this.options.delay,
        );
    }

    /**
     * Destroy the transition
     */
    async destroy(instant = false) {
        if (this.destroying == true) return;
        this.destroying = true;
        let time = instant ? 0 : this.options.fadeOut;
        clearTimeout(this.timeout);

        if (this.audio?.playing) {
            this.fadeAudio(this.audio, time);
        }

        return $(this.element)
            ?.fadeOut(time, () => {
                this.element.remove();
                this.element = null;
            })
            .promise();
    }

    updateData(newData) {
        this.options = foundry.utils.mergeObject(this.options, newData);
        return this;
    }

    getJournalText() {
        //@ts-ignore
        return Utils.retrieveFirstTextFromJournalId(this.journal?.id, undefined, false);
    }

    getJournalImg() {
        //@ts-ignore
        return Utils.retrieveFirstImageFromJournalId(this.journal?.id, undefined, false);
    }

    /**
     * Fade audio
     * @param {*} audio The audio
     * @param {*} time  The fade duration
     * @returns
     */
    fadeAudio(audio, time) {
        if (!audio?.playing) {
            return;
        }
        if (time == 0) {
            audio.stop();
            return;
        }
        let volume = audio.gain.value;
        let targetVolume = 0.000001;
        let speed = (volume / time) * 50;
        audio.gain.value = volume;
        let fade = function () {
            volume -= speed;
            audio.gain.value = volume.toFixed(6);
            if (volume.toFixed(6) <= targetVolume) {
                audio.stop();
                clearInterval(audioFadeTimer);
            }
        };
        let audioFadeTimer = setInterval(fade, 50);
        fade();
    }
}
