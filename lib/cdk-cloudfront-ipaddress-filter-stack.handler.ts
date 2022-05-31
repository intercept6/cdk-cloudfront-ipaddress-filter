import { ALBHandler } from 'aws-lambda'

export const handler: ALBHandler = async (event) => {
  console.log(event)

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  }
}
