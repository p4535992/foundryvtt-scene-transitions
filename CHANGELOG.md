### 13.0.0

- Updated for FoundryVTT v13 compatibility

### 12.0.1

- Bug fix: https://github.com/p4535992/foundryvtt-scene-transitions/issues/39#issuecomment-2425044453 ty to @Conradhowlf

### 12.0.0

- Little fix Respect fade-out settings for GM-prompted transition closure for ty the pr  https://github.com/p4535992/foundryvtt-scene-transitions/pull/41 from @cavesnail 


### 0.5.6

- Ty to @Larkinabout
- Bug fix: https://github.com/p4535992/foundryvtt-scene-transitions/issues/37

### 0.5.4-0.5.5

- Ty to @Larkinabout for many bug fixing and v12 compatibility
- Bug fix: https://github.com/p4535992/foundryvtt-scene-transitions/issues/35
- Bug fix: https://github.com/p4535992/foundryvtt-scene-transitions/issues/33
- Bug fix: https://github.com/p4535992/foundryvtt-scene-transitions/issues/32

### 0.5.3

- Apply the pr: https://github.com/p4535992/foundryvtt-scene-transitions/pull/30 ty to @Larkinabout

### 0.5.2

- Try to Bug fix: https://github.com/p4535992/foundryvtt-scene-transitions/issues/25 ty to @Larkinabout
- Try to Bug fix: https://github.com/p4535992/foundryvtt-scene-transitions/issues/26 ty to @Larkinabout
- Apply the PR https://github.com/p4535992/foundryvtt-scene-transitions/pull/29 ty to @Larkinabout
- Bug fix: https://github.com/p4535992/foundryvtt-scene-transitions/issues/24

### 0.5.1

- Cleanup up the code nothing more

### 0.4.12

- Try to fix: https://github.com/p4535992/foundryvtt-scene-transitions/issues/17

### 0.4.11

- Bug fix: https://github.com/p4535992/foundryvtt-scene-transitions/issues/13

### 0.4.8-9-10

- Fixed preview
- Some clean up
- Some minor bug fix

### 0.4.7

- Bug fix: https://github.com/p4535992/foundryvtt-scene-transitions/issues/13

### 0.4.6

- Add pack with a macro example
- Add a setting for activate the scene on the play transiction

### 0.4.5

- Many bug fixes

### 0.4.4

- Add audio loop setting
- Add video muted setting
- Add video loop setting
- Clean up of the code

### 0.4.3

- Added video support

### 0.4.0-1-2

- Upgrade for fvtt 10

### 0.3.0

Support Foundry V9 - thanks pchouzenoux!

### 0.2.1
Added Show User Interface (showUI) option to show the user interface to players during the transition
UI always shows for the GM

### 0.1.3
Fix z-index on the editor form! ugh

### 0.1.2
Fix z-index so transition sits on top of everything

### 0.1.1
New helper for macros - Transition.macro(options, showMe)
Use new WebAudio API for sound (0.8.2+)
Added option to hide transition on other GM broswer windows (default true)
Added option to end the transition when the GM ends iy (deafult true)
Refactor to clean up global namespace
Refactor sceneID to be part of options object for simplictity
FVTT 0.8.2+ compatability

### 0.0.9
Play as Transition from Journal top bar can be hidden in the module settings
Set initial volume of the audio file

### 0.0.8
0.8 Compatability. Minor fixes and clean up

### 0.0.7
0.7.5 Fix. Pull Request merge to fade out audio.


Full credit to @WillS for the orgianl idea and developent of Scene Transitions:
### 0.0.6
You can now create and send a transition to all players using a macro. There is now a 'Play as Transition' option on the context menu for Journal Entries and it's sheet header. This takes the content and image from the journal and makes a transition out of it with the default settings.

### 0.0.5
Background size and positioning is now configurable.

### 0.0.4
Fixed some bugs.

### 0.0.3
Hotfix: Socket emit transition did not have preview mode set.

### 0.0.2
Removed preview from form window and instead create live preview transition in the background.

### 0.0.1
Alpha Release
Click Create Transition on scene context menu. Add text, audio, and background image. Set length to show players and whether you want players to be able to close it.
