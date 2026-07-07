import buffer from "buffer";
if (!buffer.SlowBuffer) {
  buffer.SlowBuffer = buffer.Buffer;
}
