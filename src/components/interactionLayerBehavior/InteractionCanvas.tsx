import * as React from "react"
import { canvasEvent } from "../svg/frameFunctions"

type InteractionCanvasProps = {
    height: number,
    width: number,
    overlayRegions: any,
    margin: any,
    voronoiHover: Function
}

type InteractionCanvasState = {
    ref: any,
    interactionContext: any
}

class InteractionCanvas extends React.Component<InteractionCanvasProps, InteractionCanvasState> {
    constructor(props: InteractionCanvasProps) {
        super(props)

        this.state = {
            ref: null,
            interactionContext: null
        }
    }

    canvasMap: Map<string, number> = new Map()

    componentDidMount() {
        this.canvasRendering()
    }

    componentDidUpdate(prevProps: InteractionCanvasProps, prevState: InteractionCanvasState) {
        if (prevProps.width !== this.props.width || prevProps.height !== this.props.height || this.props.overlayRegions !== prevProps.overlayRegions || !prevState.interactionContext && this.state.interactionContext) {
            this.canvasRendering()
        }
    }


    canvasRendering = () => {
        const canvasMap = this.canvasMap
        const { interactionContext } = this.state
        const { voronoiHover, height, width, overlayRegions, margin } = this.props

        if (interactionContext === null || !overlayRegions) return

        const boundCanvasEvent = canvasEvent.bind(
            null,
            interactionContext,
            overlayRegions,
            this.canvasMap
        )
        interactionContext.onmousemove = e => {
            const overlay = boundCanvasEvent(e)
            if (overlay && overlay.props) {
                overlay.props.onMouseEnter()
            } else {
                voronoiHover(null)
            }
        }
        interactionContext.onclick = e => {
            const overlay = boundCanvasEvent(e)
            if (overlay && overlay.props) {
                overlay.props.onClick()
            }
        }
        interactionContext.ondblclick = e => {
            const overlay = boundCanvasEvent(e)
            if (overlay && overlay.props) {
                overlay.props.onDoubleClick()
            }
        }

        canvasMap.clear()

        const interactionContext2D = interactionContext.getContext("2d")

        interactionContext2D.imageSmoothingEnabled = false
        interactionContext2D.setTransform(1, 0, 0, 1, margin.left, margin.top)
        interactionContext2D.clearRect(
            -margin.left,
            -margin.top,
            width,
            height
        )

        interactionContext2D.lineWidth = 1

        overlayRegions.forEach((overlay, oi) => {
            const interactionRGBA = `rgba(${Math.floor(
                Math.random() * 255
            )},${Math.floor(Math.random() * 255)},${Math.floor(
                Math.random() * 255
            )},255)`

            canvasMap.set(interactionRGBA, oi)

            interactionContext2D.fillStyle = interactionRGBA
            interactionContext2D.strokeStyle = interactionRGBA

            const p = new Path2D(overlay.props.d)
            interactionContext2D.stroke(p)
            interactionContext2D.fill(p)
        })
    }


    render() {
        const { width, height } = this.props

        return <canvas
            className="frame-canvas-interaction"
            ref={(canvasContext: any) => {
                if (canvasContext && this.state.interactionContext !== canvasContext) {
                    this.setState({ interactionContext: canvasContext })
                }
            }}
            style={{
                position: "absolute",
                left: `0px`,
                top: `0px`,
                imageRendering: "pixelated",
                pointerEvents: "all",
                opacity: 0
            }}
            width={width}
            height={height}
        />
    }
}

export default InteractionCanvas