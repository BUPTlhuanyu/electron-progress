![npm](https://img.shields.io/npm/dt/electron-progressbar?label=installs&style=flat-square)

electron-progress
================
This project is inspired by [electron-progressbar](https://github.com/AndersonMamede/electron-progressbar.git)
> electron-progress provides an easy-to-use and highly customizable API to show and control progress bars on Electron applications.

You can customize the aspects of the windows (electron's BrowserWindow), progress bars' visual aspects (CSS), texts and also all visible information.

For more smooth animation we use the way of the `React Scheduler` to schedule task.

***
## Table of Contents

* [Installation](#installation)
* [API](#api)
    * [`Methods`](#methods)
      * [`.new ProgressBar(options, [electronApp])`](#new-progressbaroptions-electronapp)
      * [`.getOptions()`](#getoptions--object) ⇒ <code>object</code>
      * [`.on(eventName, listener)`](#oneventname-listener--reference-to-this) ⇒ <code>reference to this</code>
        * [`Events`](#events)
          * [`ready`](#event-ready)
          * [`progress`](#event-progress)
          * [`completed`](#event-completed)
          * [`aborted`](#event-aborted)
      * [`.setCompleted()`](#setcompleted)
      * [`.close()`](#close)
      * [`.isInProgress()`](#isinprogress--boolean) ⇒ <code>boolean</code>
      * [`.isCompleted()`](#iscompleted--boolean) ⇒ <code>boolean</code>
    * [`Properties`](#properties)
      * [`value`](#value--number) ⇒ number
      * [`text`](#text--string) ⇒ string
      * [`detail`](#detail--string) ⇒ string
* [Changelog](#changelog)
* [License](#license)

## Installation

Install with `npm`:

``` bash
$ npm i electron-progress
```

## API

### `Methods`

##### `new ProgressBar(options, [electronApp])`

Create a new progress bar. Because [electron's BrowserWindow](https://github.com/electron/electron/blob/master/docs/api/browser-window.md) is used to display the progress bar and it only works after [electron's "ready" event](https://github.com/electron/electron/blob/master/docs/api/app.md#event-ready), you have wait for the "ready" event before creating a progress bar; optionally, you can just pass electron's app as a second parameter (`electronApp`).

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>object</code> |  | electron-progressbar options |
| [options.abortOnError] | <code>boolean</code> | <code>false</code> | Whether progress bar should abort and close if an error occurs internally. |
| [options.initialValue] | <code>number</code> | <code>0</code> | Progress bar's initial value. _Used only for determinate progress bar._ |
| [options.maxValue] | <code>number</code> | <code>100</code> | Progress bar's maximum value. When progress bar's value reaches this number, it will be set to completed and event `complete` will be fired. _Used only for determinate progress bar._ |
| [options.closeOnComplete] | <code>boolean</code> | <code>true</code> | Whether progress bar window should be automatically closed after completed. If false, the progress bar must be manually closed by calling its `close` method. |
| [options.title] | <code>string</code> | <code>'Wait...'</code> | Text shown on title bar. |
| [options.text] | <code>string</code> | <code>'Wait...'</code> | Text shown inside the window and below the progress bar. |
| [options.detail] | <code>string</code> | | Text shown between `text` and the progress bar element. Can be used to display detailed information, e.g., the current step of a task. Usually setting this property later is more useful because your application can determine and display, in real time, what is currently happening. |
| [options.styleStr] | <code>object</code> |  | Visual styles for elements: `text`, `detail`, `bar` and `value`. All elements properties are purely CSS, just the way it is used in a `CSS file`. |
| [options.centerHtmlStr] | <code>string</code> |  | use the html string to change the view of the center of the circle progress |
| [options.extraScript] | <code>string</code> |  | extra script run in the progress's window |
| [options.strokeWidth] | <code>number</code> | <code>100</code> | width of progress bar. unit is 'px' |
| [options.strokeColor] | <code>string</code> | <code>#236EFF</code> | color of progress bar. |
| [options.strokeLinecap] | <code>'round', 'square' </code> | <code>'round'</code> | the style of the end of progress bar. |
| [options.gapDegree] | <code>number</code> | <code>0</code> | the value of the gap of progress bar.|
| [options.gapPosition] | <code>'top', 'bottom', 'left', 'right'</code> | <code>'bottom'</code> | width of progress bar. |
| [options.trailColor] | <code>object</code> | <code>#f3f3f3</code> | width of progress bar. |
| [options.remoteWindow] | <code>instance of BrowserWindow</code> | <code>null</code> | The BrowserWindow to use for the progress bar. When null/empty, a new BrowserWindow will be created. By default, a new BrowserWindow is created, unless this option is specified. |
| [options.browserWindow] | <code>object</code> |  | [`Electron's BrowserWindow options`](https://github.com/electron/electron/blob/master/docs/api/browser-window.md#new-browserwindowoptions). Although only a few options are set by default, you can specify any of [`Electron's BrowserWindow options`](https://github.com/electron/electron/blob/master/docs/api/browser-window.md#new-browserwindowoptions). |
| [options.browserWindow.parent] | <code>instance of BrowserWindow</code> | <code>null</code> | A [BrowserWindow instance](https://github.com/electron/electron/blob/master/docs/api/browser-window.md). If informed, the progress bar window will always show on top of the parent window and will block it so user can't interact with it until the progress bar is completed/aborted and closed. |
| [options.browserWindow.modal] | <code>boolean</code> | <code>true</code> | Whether this is a modal window. This actually only works if progress bar window is a child window, i.e., when its `parent` is informed. |
| [options.browserWindow.resizable] | <code>boolean</code> | <code>false</code> | Whether window is resizable. |
| [options.browserWindow.closable] | <code>boolean</code> | <code>false</code> | Whether window is closable. |
| [options.browserWindow.minimizable] | <code>boolean</code> | <code>false</code> | Whether window is minimizable. |
| [options.browserWindow.maximizable] | <code>boolean</code> | <code>false</code> | Whether window is maximizable. |
| [options.browserWindow.width] | <code>number</code> | <code>450</code> | Progress bar window's width in pixels. |
| [options.browserWindow.height] | <code>number</code> | <code>175</code> | Progress bar window's height in pixels. |
| [options.browserWindow<br>.webPreferences.nodeIntegration] | <code>boolean</code> | <code>true</code> | Whether node integration is enabled. |

* * *

##### `getOptions()` ⇒ <code>object</code>

Return a copy of all current options.

* * *

##### `on(eventName, listener)` ⇒ <code>reference to this</code>

Adds the listener function to the end of the listeners array for the event named `eventName`. No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination of `eventName` and `listener` will result in the `listener` being added and called multiple times.

Returns a reference to `this` so that calls can be chained.

### Events

| Event name | Receives parameter | Description |
| --- | --- | --- |
| <a name="event-ready"></a>ready | | Fired when progress bar is created and ready to be used and controlled. |
| <a name="event-progress"></a>progress | value | Available only for **determinate** progress bar. Fired every time the progress bar's value is changed. The listener receives, as first parameter, the current progress bar's value. |
| <a name="event-completed"></a>completed | value | Fired when progress bar is completed, i.e., its value reaches `maxValue` or method `complete` is called. The listener receives, as first parameter, the current progress bar's value. |
| <a name="event-aborted"></a>aborted | value | Fired if progress bar is closed when it's not completed yet, i.e., when user closes progress bar window or method `close` is called before progress bar is completed. The listener receives, as first parameter, the current progress bar's value. |

* * *

##### `setCompleted()`

Set progress bar as complete. This means the whole task is finished.

* * *

##### `close()`

Close progress bar window. If progress bar is not completed yet, it'll be aborted and event `aborted` will be fired.

* * *

##### `isInProgress()` ⇒ <code>boolean</code>

Return true if progress bar is currently in progress, i.e., it hasn't been completed nor aborted yet, otherwise false.

* * *

##### `isCompleted()` ⇒ <code>boolean</code>

Return true if progress bar is completed, otherwise false.

* * *

### `Properties`

#### `value` ⇒ <code>number</code>

Get or set progress bar's `value`. Only available for **determinate** progress bar.

* * *

#### `text` ⇒ <code>string</code>

Get or set the `text`. This information is shown inside the window and above the progress bar.

* * *

#### `detail` ⇒ <code>string</code>

Get or set the `detail`. This information is shown between `text` and the progress bar element. Useful to display any detailed information, e.g., the current status in real time or the current step of the task.

* * *

## Changelog

[Changelog](/CHANGELOG.md)

## License

MIT. See [LICENSE.md](http://github.com/AndersonMamede/electron-progressbar/blob/master/LICENSE) for details.
