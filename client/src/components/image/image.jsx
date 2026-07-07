const Image = ({ path, src, alt, className, w, h }) => {
  let finalSrc = src;
  
  if (path) {
    if (!path.startsWith("/general") && !path.startsWith("/pins")) {
      // It's a MinIO uploaded file
      // URL format: <IMGPROXY_URL>/insecure/rs:fill:<w>:<h>/plain/s3://<BUCKET_NAME>/<FILE_NAME>
      const imgProxyUrl = import.meta.env.VITE_IMGPROXY_URL || "http://localhost:8080";
      const bucketName = import.meta.env.VITE_MINIO_BUCKET || "pinterest";
      
      // If width/height are provided, use them for imgproxy resizing
      const rw = w ? Math.round(w) : 0;
      const rh = h ? Math.round(h) : 0;
      const resizeParams = (rw || rh) ? `rs:fill:${rw}:${rh}/` : "";
      
      finalSrc = `${imgProxyUrl}/insecure/${resizeParams}plain/s3://${bucketName}/${path}`;
    } else {
      // Local static path (e.g. /general/upload.svg)
      finalSrc = path;
    }
  }

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      width={w}
      height={h}
      loading="lazy"
    />
  );
};

export default Image;

