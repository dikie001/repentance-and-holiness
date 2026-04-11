import { useEffect, useRef } from "react"

interface SpectrumVisualizerProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>
  playing: boolean
}

export function SpectrumVisualizer({
  analyserRef,
  playing,
}: SpectrumVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const prevHeightsRef = useRef<number[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    const bars = 128
    const barWidth = canvas.width / bars
    const gapWidth = barWidth * 0.15

    // Initialize previous heights for smoothing
    if (prevHeightsRef.current.length === 0) {
      prevHeightsRef.current = Array(bars).fill(0)
    }

    const draw = () => {
      const analyser = analyserRef.current

      // Clear with semi-transparent background for fade effect
      ctx.fillStyle = "rgba(15, 23, 42, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!analyser || !playing) {
        // Fade out idle bars
        requestAnimationFrame(draw)
        return
      }

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(dataArray)

      // Draw horizontal spectrum bars with smoothing
      for (let i = 0; i < bars; i++) {
        const dataIndex = Math.floor((i / bars) * dataArray.length)
        const value = (dataArray[dataIndex] ?? 0) / 255

        // Smooth the value with previous height
        const smoothFactor = 0.6
        const smoothedValue =
          prevHeightsRef.current[i] * smoothFactor +
          value * (1 - smoothFactor)
        prevHeightsRef.current[i] = smoothedValue

        // Calculate bar height (inverted so it goes upward)
        const barHeight = smoothedValue * canvas.height
        const x = i * barWidth + gapWidth / 2
        const y = canvas.height - barHeight

        // Create gradient from pink/magenta to more vibrant colors
        const gradient = ctx.createLinearGradient(x, y, x, canvas.height)

        // Pink/Red/Magenta gradient similar to the image
        const hue = 340 + i * 0.15 // Pink to magenta range
        const saturation = 90 + smoothedValue * 10
        const lightness = 45 + smoothedValue * 15

        gradient.addColorStop(
          0,
          `hsl(${hue}, ${saturation}%, ${lightness}%)`
        )
        gradient.addColorStop(
          0.5,
          `hsl(${hue + 20}, ${saturation}%, ${lightness - 5}%)`
        )
        gradient.addColorStop(
          1,
          `hsla(${hue + 40}, ${saturation}%, ${lightness - 10}%, 0.3)`
        )

        // Draw the bar with rounded top
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.moveTo(x, canvas.height)
        ctx.lineTo(x, y)
        ctx.lineTo(x + (barWidth - gapWidth), y)
        ctx.lineTo(x + (barWidth - gapWidth), canvas.height)
        ctx.closePath()
        ctx.fill()

        // Add subtle glow for the active bars
        if (smoothedValue > 0.2) {
          ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.4)`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    animationRef.current = requestAnimationFrame(draw)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [analyserRef, playing])

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ display: "block" }}
    />
  )
}
