export default function errorHandler(err) {
  console.error(err)
  throw new Error('Operation failed')
}
