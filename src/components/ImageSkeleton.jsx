function ImageSkeleton() {
  return (
    <div className="absolute inset-0 bg-[#eee5df] animate-pulse">
      <div className="w-full h-full bg-gradient-to-r from-[#eee5df] via-[#f8f3ef] to-[#eee5df]" />
    </div>
  );
}

export default ImageSkeleton;