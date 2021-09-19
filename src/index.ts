export interface WaterMarkConfig {
	// canvas宽度,默认200
	width?: number;
	// canvas高度,默认200
	height?: number;
	// 水印文本
	content: string;
	// 承载容器,默认为body
	container?: string | HTMLElement;
	// 文案旋转角度,默认-30
	rotate?: number;
	// 水印字体,默认为 14px Microsoft Yahei
	font?: string;
	// 旋转X轴开始位置,默认为canvas中心点
	xStartPoint?: number;
	// 旋转Y轴开始位置,默认为canvas中心点
	yStartPoint?: number;
	// canvas文案颜色,默认为rgba(184, 184, 184, 0.7)
	fillStyle?: string;
	// canvas文本居中方式,默认为center
	textAlign?: CanvasTextAlign;
	// canvas文本绘制基线,默认为center
	textBaseLine?: CanvasTextBaseline;
	// 保持水印常在,默认true
	keepAlive?: boolean;
	// 图层层级,默认值 -1
	zIndex?: number;
}

class WaterMark {
	// 默认配置
	#defaultConfig: WaterMarkConfig;
	// 观察者
	#observer?: MutationObserver;
	// 水印容器ID
	#waterMarkId: string = "__wm__";

	constructor(config: WaterMarkConfig) {
		this.#defaultConfig = {
			width: 200,
			height: 200,
			rotate: -30,
			zIndex: -1,
			keepAlive: true,
			textAlign: "center",
			textBaseLine: "middle",
			font: "14px Microsoft Yahei",
			fillStyle: "rgba(184, 184, 184, 0.7)",
			...config
		};
	}
	get config(): WaterMarkConfig {
		return this.#defaultConfig;
	}
	get #hadWaterMark(): boolean {
		return document.getElementById(this.#waterMarkId) !== null;
	}
	// 创建水印
	create() {
		if (this.#hadWaterMark) return;
		const { container, keepAlive, zIndex } = this.#defaultConfig;
		const containerElement = this.#getContainerElement(container);
		if (!containerElement) {
			throw Error(`Can not get element by container(${container})`);
		}
		const img = this.#createWaterMark(this.#defaultConfig);
		const waterMarkContainer = this.#createWaterMarkContainer(
			`background-image: url(${img});background-repeat: space;z-index:${zIndex}`
		);
		containerElement.appendChild(waterMarkContainer);
		if (keepAlive) {
			this.#observeElement(
				containerElement,
				waterMarkContainer.getAttribute("style")!
			);
		}
	}
	// 移除水印
	remove() {
		if (!this.#hadWaterMark) return;
		this.#observer?.disconnect();
		// @ts-ignore
		this.#observer = null;
		const waterMarkContainer = document.getElementById(this.#waterMarkId);
		waterMarkContainer?.parentElement?.removeChild(waterMarkContainer);
	}
	#observeElement(container: HTMLElement, style: string) {
		this.#observer = new MutationObserver(() => {
			const div = document.getElementById(this.#waterMarkId);
			const hadStyle = div?.getAttribute("style");
			// 节点被删除
			if (div == null) {
				this.#observer?.disconnect();
				// @ts-ignore
				this.#observer = null;
				this.create();
			} else if (!hadStyle || !hadStyle.includes(style)) {
				// 样式被移除
				div.setAttribute("style", style);
			}
		});
		this.#observer.observe(container, {
			attributes: true,
			childList: true,
			subtree: true,
			attributeFilter: ["style"]
		});
	}
	// 创建水印容器元素并设置样式
	#createWaterMarkContainer(style: string): HTMLElement {
		const div = document.createElement("div");
		div.setAttribute(
			"style",
			`position:fixed;top:0;left:0;width:100vw;height:100vh;background-color:transparent;pointer-events: none;${style}`
		);
		div.id = this.#waterMarkId;
		return div;
	}
	// 获取水印容器
	#getContainerElement(
		container: string | HTMLElement | undefined
	): HTMLElement | null {
		if (!container) {
			return document.body;
		} else if (typeof container === "string") {
			return document.querySelector(container);
		} else if (container.ELEMENT_NODE) {
			return container;
		}
		return null;
	}
	// 创建水印,生成图片并返回
	#createWaterMark(config: WaterMarkConfig): string {
		const {
			width,
			height,
			font,
			fillStyle,
			textAlign,
			textBaseLine,
			rotate,
			content,
			xStartPoint,
			yStartPoint
		} = config;
		let canvas = document.createElement("canvas");
		canvas.width = width!;
		canvas.height = height!;
		const ctx = canvas.getContext("2d")!;
		const x = xStartPoint == null ? width! / 2 : xStartPoint;
		const y = yStartPoint == null ? height! / 2 : yStartPoint;
		ctx.font = font!;
		ctx.fillStyle = fillStyle!;
		ctx.textAlign = textAlign!;
		ctx.textBaseline = textBaseLine!;
		ctx.translate(x, y);
		if (rotate) {
			ctx.rotate((Math.PI / 180) * rotate);
		}
		ctx.fillText(content, 0, 0);
		ctx.translate(-x, -y);
		const img = canvas.toDataURL("image/png");
		// @ts-ignore
		canvas = null;
		return img;
	}
}

export default WaterMark;
