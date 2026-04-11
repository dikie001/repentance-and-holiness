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

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      const analyser = analyserRef.current
      if (!analyser || !playing) {
        // Draw empty state
        ctx.fillStyle = "rgba(99, 102, 241, 0.2)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        animationRef.current = requestAnimationFrame(draw)
        return
      }

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(dataArray)

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "rgba(30, 41, 59, 0)")
      gradient.addColorStop(0.5, "rgba(99, 102, 241, 0.05)")
      gradient.addColorStop(1, "rgba(30, 41, 59, 0)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw spectrum bars in a circular pattern
      const bars = 64
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = 80

      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2
        const dataIndex = Math.floor((i / bars) * dataArray.length)
        const value = dataArray[dataIndex] / 255

        // Smooth the value
        const barHeight = value * 40 + 5

        const x1 = centerX + Math.cos(angle) * radius
        const y1 = centerY + Math.sin(angle) * radius
        const x2 = centerX + Math.cos(angle) * (radius + barHeight)
        const y2 = centerY + Math.sin(angle) * (radius + barHeight)

        // Create gradient for each bar
        const barGradient = ctx.createLinearGradient(x1, y1, x2, y2)
        const hue = (i / bars) * 360
        barGradient.addColorStop(
          0,
          `hsl(${hue}, 100%, 50%)`
        )
        barGradient.addColorStop(
          1,
          `hsl(${(hue + 60) % 360}, 100%, 60%)`
        )

        ctx.strokeStyle = barGradient
        ctx.lineWidth = Math.max(2, 3 * value)
        ctx.lineCap = "round"
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
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
      width={300}
      height={300}
      className="absolute inset-0 h-full w-full opacity-60"
    />
  )
}
