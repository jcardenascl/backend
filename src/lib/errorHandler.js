export default function errorHandler(err, msg) {
  console.error(err)

  throw new Error(msg)
}
