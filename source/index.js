const BrowserWindow = require('electron').BrowserWindow;

// use 'extend' because 'Object.assign' doesn't work for deep copy
const extend = require('extend');
const templateData = {
	schedulerScript : `
	// 调度器
	let progressScheduler = {
		ANIMATION_FRAME_TIMEOUT: 100,
		rAFID: -1,
		rAFTimeoutID: -1,
		requestAnimationFrameWithTimeout: function(callback) {
			progressScheduler.rAFID = window.requestAnimationFrame(function(timestamp) {
			  clearTimeout(progressScheduler.rAFTimeoutID);
			  callback();
			});
			progressScheduler.rAFTimeoutID = setTimeout(function() {
			  cancelAnimationFrame(progressScheduler.rAFID);
			  callback();
			}, progressScheduler.ANIMATION_FRAME_TIMEOUT);
		},
		updateViewListTask: [],
		scheduleCallback: function(callback){
			progressScheduler.updateViewListTask.push(callback);
		},
		requestCallback: function() {
			return progressScheduler.updateViewListTask.shift();
		},
		messageKey: '__progressIdleCallback$' + Math.random().toString(36).slice(2),
		taskRunner: function() {
			if (progressScheduler.updateViewListTask.length > 0) {
				let callback = progressScheduler.requestCallback();
				typeof callback === 'function' && callback();
			}
			window.postMessage(progressScheduler.messageKey, '*'); // 在重绘之后执行
		},
		idleTick: function(event) {
			if (event.source !== window || event.data !== progressScheduler.messageKey) {
				return;
			}
			progressScheduler.requestAnimationFrameWithTimeout(progressScheduler.taskRunner);
		}
	}
	window.addEventListener('message', progressScheduler.idleTick, false);
	`,
	defaultCenterHtml : '',
	defaultStyle : `
	html {
		background: #fff;
	}
	body {
		margin: 24px 0;
	}
	.electron-progress {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.progress-information {
		text-align: center;
		margin-top: 24px;
		font-size: 18px;
	}
	.progress-information-step {
		margin-top: 12px;
		font-size: 12px;
		color: #666666;
	}
	.progress {
		font-family: "Chinese Quote", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
		font-size: 14px;
		font-variant: tabular-nums;
		line-height: 1.5;
		color: rgba(0, 0, 0, 0.65);
		box-sizing: border-box;
		margin: 0;
		padding: 0;
		list-style: none;
		display: inline-block;
	}
	.progress-line {
		width: 100%;
		font-size: 14px;
		position: relative;
		letter-spacing: -1em;
	}
	.progress-small.progress-line,
	.progress-small.progress-line .progress-text .icon {
		font-size: 12px;
	}
	.progress-outer {
		display: inline-block;
		width: 100%;
		margin-right: 0;
		padding-right: 0;
	}
	.progress-show-info .progress-outer {
		padding-right: calc(2em + 8px);
		margin-right: calc(-2em - 8px);
	}
	.progress-inner {
		display: inline-block;
		width: 100%;
		background-color: transparent;
		border-radius: 100px;
		vertical-align: middle;
		position: relative;
	}
	.progress-circle-trail {
		stroke: #f5f5f5;
	}
	.progress-circle-path {
		stroke: #1890ff;
		animation: progress-appear 0.3s;
	}
	.progress-success-bg,
	.progress-bg {
		background-color: #1890ff;
		transition: all 0.4s cubic-bezier(0.08, 0.82, 0.17, 1) 0s;
		position: relative;
	}
	.progress-success-bg {
		background-color: #52c41a;
		position: absolute;
		top: 0;
		left: 0;
	}
	.progress-text {
		position: absolute;
		transform: translateY(-50%);
		top: 50%;
		left: 0;
		margin: 0;
		word-break: normal;
		width: 100%;
		text-align: center;
		font-size: 1em;
		vertical-align: middle;
		display: inline-block;
		white-space: nowrap;
		letter-spacing: normal;
		color: rgba(0, 0, 0, 0.45);
		line-height: 1;
	}
	.progress-text .icon {
		font-size: 14px;
	}
	.progress-status-active .progress-bg:before {
		content: "";
		opacity: 0;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: #fff;
		border-radius: 10px;
		animation: progress-active 2.4s cubic-bezier(0.23, 1, 0.32, 1) infinite;
	}
	.progress-status-exception .progress-bg {
		background-color: #f5222d;
	}
	.progress-status-exception .progress-text {
		color: #f5222d;
	}
	.progress-status-exception .progress-circle-path {
		stroke: #f5222d;
	}
	.progress-status-success .progress-bg {
		background-color: #52c41a;
	}
	.progress-status-success .progress-text {
		color: #52c41a;
	}
	.progress-status-success .progress-circle-path {
		stroke: #52c41a;
	}
	.progress-circle .progress-inner {
		position: relative;
		line-height: 1;
		background-color: transparent;
	}
	.progress-circle .progress-text {
		display: block;
		position: absolute;
		width: 100%;
		text-align: center;
		line-height: 1;
		top: 50%;
		transform: translateY(-50%);
		left: 0;
		margin: 0;
		color: rgba(0, 0, 0, 0.65);
		white-space: normal;
		padding: 0 6px;
	}
	.progress-circle .progress-text .icon {
		font-size: 1.16666667em;
	}
	.progress-circle.progress-status-exception .progress-text {
		color: #f5222d;
	}
	.progress-circle.progress-status-success .progress-text {
		color: #52c41a;
	}
	@keyframes progress-active {
		0% {
			opacity: 0.1;
			width: 0;
		}
		20% {
			opacity: 0.5;
			width: 0;
		}
		100% {
			opacity: 0;
			width: 100%;
		}
	}
	`,
	defaultScript : `
	function validProgress(progress, maxValue) {
		progress = 100 / maxValue * progress;
		if (!progress || progress < 0) {
			return 0;
		}
		if (progress > 100) {
			return 100;
		}
		return progress;
	};
	
	function setAttribute(dom, attributes) {
		Object.entries(attributes).forEach(([key, value]) => {
			if (key === 'style' && dom.style.cssText !== value) {
				dom.style.cssText = value;
			}
			else if (dom.getAttribute(key) !== value) {
				dom.setAttribute(key, value);
			}
		});
	}
	
	// 修改组件state
	var state = {
		options: {},
		progress : {
			circleProps: {
	
			},
			circletrailProps: {
	
			},
			circlePathProps: {
	
			}
		},
		infoTextProps: {
			text: ''
		},
		infoStep: {
			text: ''
		}
	};
	
	// 存储组件中的dom
	var elements = {
		circle : document.querySelector(".progress-circle"),
		circletrail: document.querySelector(".progress-circle-trail"),
		circlepath: document.querySelector(".progress-circle-path"),
		infoText: document.querySelector(".progress-information-text"),
		infoStep: document.querySelector(".progress-information-step")
	};
	
	// 修改环形宽度，环形末端的形状
	function updateStroke() {
		state.progress.circletrailProps.stroke = state.options.trailColor; // 未完成的颜色
		state.progress.circletrailProps['stroke-width'] = state.options.strokeWidth;
		state.progress.circlePathProps['stroke-linecap'] = state.options.strokeLinecap;
		state.progress.circlePathProps['stroke-width'] = state.options.percent === 0 ? 0 : state.options.strokeWidth; // 已完成的线条宽度
	}
	
	// 修改环形的path
	function updatePathStringState(){
		var {
			percent,
			strokeWidth,
			gapPosition
		} = state.options;
	
		var radius = 50 - (strokeWidth / 2);
		var beginPositionX = 0;
		var beginPositionY = -radius;
		var endPositionX = 0;
		var endPositionY = -2 * radius;
	
		switch (gapPosition) {
			case 'left':
				beginPositionX = -radius;
				beginPositionY = 0;
				endPositionX = 2 * radius;
				endPositionY = 0;
				break;
			case 'right':
				beginPositionX = radius;
				beginPositionY = 0;
				endPositionX = -2 * radius;
				endPositionY = 0;
				break;
			case 'bottom':
				beginPositionY = radius;
				endPositionY = 2 * radius;
				break;
			default:
		}
	
		var pathString = "M 50,50 m ".concat(beginPositionX, ",").concat(beginPositionY, " a ").concat(radius, ",").concat(radius, " 0 1 1 ").concat(endPositionX, ",").concat(-endPositionY, " a ").concat(radius, ",").concat(radius, " 0 1 1 ").concat(-endPositionX, ",").concat(endPositionY, "");
		state.progress.circletrailProps.d = pathString;
		state.progress.circlePathProps.d = pathString;
	}
	
	// 修改表示未完成部分的样式状态
	function updateTrailPathState() {
		var {
			percent,
			strokeWidth,
			gapDegree,
			maxValue
		} = state.options;
	
		percent = validProgress(percent, maxValue);
		var radius = 50 - (strokeWidth / 2);
		var len = Math.PI * 2 * radius;
	
		var trailPathStyle = "stroke-dasharray: ".concat(len - gapDegree, "px ").concat(len, "px;stroke-dashoffset: -").concat(gapDegree / 2, "px;transition: stroke-dashoffset .3s ease 0s, stroke-dasharray .3s ease 0s, stroke .3s;");
		state.progress.circletrailProps.style = trailPathStyle;
	}
	
	// 修改progress的进度
	function updateProgressState() {
		var {
			percent,
			strokeWidth,
			strokeColor,
			gapDegree,
			maxValue
		} = state.options;
	
		percent = validProgress(percent, maxValue);
		var radius = 50 - (strokeWidth / 2);
		var len = Math.PI * 2 * radius;
	
		var strokePathStyle = "stroke: ".concat(strokeColor, ";stroke-dasharray: ").concat(percent / 100 * (len - gapDegree), "px ").concat(len, "px;stroke-dashoffset: -").concat(gapDegree / 2, "px;transition: stroke-dashoffset .3s ease 0s,    stroke-dasharray .3s ease 0s, stroke .3s,    stroke-width .06s ease .3s;");
		state.progress.circlePathProps.style = strokePathStyle;
	}
	
	// 初始化state
	function initState() {
		updateStroke();
		updatePathStringState();
		updateTrailPathState();
		updateProgressState();
	}
	
	// 更新视图属性
	function updateProgressView() {
		setAttribute(elements.circle, state.progress.circleProps);
		setAttribute(elements.circletrail, state.progress.circletrailProps);
		setAttribute(elements.circlepath, state.progress.circlePathProps);
	}
	
	// 更新info信息
	function updateInfoView() {
		if (elements.infoText.innerHTML !== state.infoTextProps.text) {
			elements.infoText.innerHTML = state.infoTextProps.text;
		}
		if (elements.infoStep.innerHTML !== state.infoStep.text) {
			elements.infoStep.innerHTML = state.infoStep.text;
		}
	}
	
	// 同步更新UI
	function synchronizeUi(){
		// 需要分开
		updateProgressView();
		updateInfoView();
	}
	
	// 初始化progress
	function createProgressBar(settings){
		state.options = Object.assign({}, state.options, settings);
		// 初始化state，更新视图
		initState();
		updateProgressView();
		updateInfoView();
		window.postMessage(progressScheduler.messageKey, '*');
	}
	
	// 接收进度数据
	require("electron").ipcRenderer.on("CREATE_PROGRESS_BAR", (event, settings) => {
		createProgressBar(settings);
	});
	
	require("electron").ipcRenderer.on("SET_PROGRESS", (event, value) => {
		state.options.percent = value;
		updateProgressState();
		progressScheduler.scheduleCallback(synchronizeUi);
	});
	
	require("electron").ipcRenderer.on("SET_COMPLETED", (event) => {
		// console.log("SET_COMPLETED");
	});
	
	require("electron").ipcRenderer.on("SET_TEXT", (event, value) => {
		state.infoTextProps.text = value;
	});
	
	require("electron").ipcRenderer.on("SET_DETAIL", (event, value) => {
		state.infoStep.text = value;
	});
	`
};

class ProgressBar {
	constructor(options, electronApp) {
		this._defaultOptions = {
			abortOnError: false,
			debug: false,
			closeOnComplete: true,
			
			initialValue: 0,
			maxValue: 100,
			
			// 样式
			strokeWidth : 4, // 进度条宽度
			strokeColor : '#236EFF', // 进度条的色彩
			strokeLinecap: 'round', // 进度条末端形状
			gapDegree : 0, // 圆形进度条缺口角度，可取值 0 ~ 360
			gapPosition : 'bottom', // 圆形进度条缺口位置
			trailColor: '#f3f3f3', // 未完成状态的颜色

			// text
			title: 'Wait...',
			text: 'Wait...',
			detail: null,

			// htmlContent
			styleStr: templateData.defaultStyle, // 自定义样式
			centerHtmlStr: templateData.defaultCenterHtml, // 可以自定义logo的图案
			extraScript: '',
			
			browserWindow: {
				width: 500,
				height: 170,
				parent: null,
				resizable: false,
				closable: false,
				minimizable: false,
				maximizable: false,
				webPreferences: {
					nodeIntegration: true
				},
			},
			
			remoteWindow: null
		};
		
		this._callbacks = {
			'ready': [], // list of function(){}
			'progress': [], // list of function(value){}
			'completed': [], // list of function(value){}
			'aborted': [] // list of function(value){}
		};
		
		this._inProgress = true;
		this._options = this._parseOptions(options);
		this._template = this._generateTemplate(this._options.styleStr, this._options.centerHtmlStr, this._options.extraScript);
		this._realValue = this._options.initialValue; // current progress
		this._window = null;
		
		if (electronApp) {
			if (electronApp.isReady()) {
				this._createWindow();
			} else {
				electronApp.on('ready', () => this._createWindow.call(this));
			}
		} else {
			this._createWindow();
		}
	}
	
	get value() {
		return this._realValue;
	}
	
	get text() {
		return this._options.text;
	}
	
	get detail() {
		return this._options.detail;
	}
	
	set title(title) {
		if (this._window) {
			this._window.setTitle(title);
		}
	}
	
	set value(value) {
		if (!this._window) {
			return this._error('Invalid call: trying to set value but the progress bar window is not active.');
		}
		
		if (!this.isInProgress()) {
			return this._error('Invalid call: trying to set value but the progress bar is already completed.');
		}
		
		if (typeof value != 'number') {
			return this._error(`Invalid call: 'value' must be of type 'number' (type found: '` + (typeof value) + `').`);
		}
		
		this._realValue = Math.max(this._options.initialValue, value);
		this._realValue = Math.min(this._options.maxValue, this._realValue);
		
		this._window.webContents.send('SET_PROGRESS', this._realValue);
		
		this._updateTaskbarProgress();
		
		this._fire('progress', [this._realValue]);
		
		this._execWhenCompleted();
	}
	
	set text(text) {
		this._options.text = text;
		this._window.webContents.send('SET_TEXT', text);
	}
	
	set detail(detail) {
		this._options.detail = detail;
		this._window.webContents.send('SET_DETAIL', detail);
	}
	
	getOptions() {
		return extend({}, this._options);
	}

	on(event, callback) {
		this._callbacks[event].push(callback);
		return this;
	}
	
	setCompleted() {
		if (!this.isInProgress()) {
			return;
		}
		
		this._realValue = this._options.maxValue;
		
		this._window.webContents.send('SET_PROGRESS', this._realValue);
		
		this._updateTaskbarProgress();
		
		this._execWhenCompleted();
	}
	
	close() {
		if (!this._window || this._window.isDestroyed()) {
			return;
		}
		
		this._window.destroy();
	}
	
	isInProgress() {
		return this._inProgress;
	}
	
	isCompleted() {
		return this._realValue >= this._options.maxValue;
	}

	_generateTemplate(style, centerHtml, extraScript) {
		return `
		<!DOCTYPE html>
		<html>
			<head>
				<meta charset="UTF-8">
				<style>
					${style}
				</style>
				<script>${templateData.schedulerScript}</script>
			</head>
			<body>
				<div class="electron-progress">
					<div
						class="progress progress-status-normal progress-show-info progress-default"
						style="width:132px;height: 132px;"
					>
						<div class="progress-inner">
							<svg
								class="progress-circle"
								viewBox="0 0 100 100"
							>
								<path
									class="progress-circle-trail"
									fill-opacity="0"
								>
								</path>
								<path
									class="progress-circle-path"
									fill-opacity="0"
								>
								</path>
							</svg>
							<span class="progress-text">
								${centerHtml}
							</span>
						</div>
					</div>
					<div class="progress-information">
						<div class="progress-information-text"></div>
						<div class="progress-information-step"></div>
					</div>
				</div>
				<script>${templateData.defaultScript}</script>
				<script>${extraScript}</script>
			</body>
		</html>
		`;
	}

	_error(message) {
		if (this._options.abortOnError) {
			if (this._window && !this._window.isDestroyed()) {
				this._window && this._window.destroy();
			}
			
			throw Error(message);
		} else {
			console.warn(message);
		}
	}
	
	_fire(event, params) {
		this._callbacks[event] && this._callbacks[event].forEach(cb => {
			cb.apply(cb, params || []);
		});
	}
	
	_parseOptions(originalOptions) {
		let options = extend(true, {}, this._defaultOptions, originalOptions);
		
		if (typeof options.maxValue !== 'number') {
			options.maxValue = 100;
			console.warn('make sure your maxValue is a number');
		}
		
		if (options.title && !options.browserWindow.title) {
			options.browserWindow.title = options.title;
		}
		
		return options;
	}
	
	_createWindow() {
		if (this._options.remoteWindow) {
			this._window = new this._options.remoteWindow(this._options.browserWindow);
		} else {
			this._window = new BrowserWindow(this._options.browserWindow);
		}

		this._window.setMenu(null);
		
		if(this._options.debug){
			this._window.webContents.openDevTools({mode: 'undocked'});
		}
		
		this._window.on('closed', () => {
			this._inProgress = false;
			this._window = null;
			
			if (this._realValue < this._options.maxValue) {
				this._fire('aborted', [this._realValue]);
			}
			
			this._updateTaskbarProgress();
		});
		
		this._window.loadURL('data:text/html;charset=UTF8,' + encodeURIComponent(this._template));
		
		this._window.webContents.on('did-finish-load', () => {
			if (this._options.text !== null) {
				this.text = this._options.text;
			}
			
			if (this._options.detail !== null) {
				this.detail = this._options.detail;
			}
			
			if (this._options.maxValue !== null) {
				this._window.webContents.send('CREATE_PROGRESS_BAR', {
					maxValue: this._options.maxValue,
					strokeWidth : this._options.strokeWidth,
					strokeColor : this._options.strokeColor,
					gapDegree : this._options.gapDegree,
					gapPosition : this._options.gapPosition,
					strokeLinecap: this._options.strokeLinecap,
					trailColor: this._options.trailColor,
				});
			}
			
			this._fire('ready');
		});
		
		this._updateTaskbarProgress();
	}
	
	_updateTaskbarProgress() {
		let mainWindow;
		
		if (this._options.browserWindow && this._options.browserWindow.parent) {
			mainWindow = this._options.browserWindow.parent;
		} else {
			mainWindow = this._window;
		}
		
		if (!mainWindow || mainWindow.isDestroyed()) {
			return;
		}
		
		if (!this.isInProgress() || this.isCompleted()) {
			// remove the progress bar from taskbar
			return mainWindow.setProgressBar(-1);
		}
		
		const percentage = (this.value * 100) / this._options.maxValue;
			
		// taskbar's progress bar must be a number between 0 and 1, e.g.:
		// 63% should be 0.63, 99% should be 0.99...
		const taskbarProgressValue = percentage / 100;
		
		mainWindow.setProgressBar(taskbarProgressValue);
	}
	
	_execWhenCompleted() {
		if (!this.isInProgress() || !this.isCompleted() || !this._window || !this._window.webContents) {
			return;
		}
		
		this._inProgress = false;
		
		this._window.webContents.send('SET_COMPLETED');
		
		this._updateTaskbarProgress();
		
		this._fire('completed', [this._realValue]);
		
		if (this._options.closeOnComplete) {
			var delayToFinishAnimation = 500;
			setTimeout(() => this.close(), delayToFinishAnimation);
		}
	}
}

module.exports = ProgressBar;
