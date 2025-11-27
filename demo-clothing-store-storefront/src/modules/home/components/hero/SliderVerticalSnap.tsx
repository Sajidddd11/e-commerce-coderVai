"use client"

const SliderVerticalSnap = ({ images }: { images: string[] }) => {
  return (
    <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory rounded-md">
      {images.map((img, i) => (
        <div key={i} className="h-full w-full snap-start">
          <img
            src={img}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      ))}
    </div>
  )
}

export default SliderVerticalSnap
