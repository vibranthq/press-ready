import aws4 from 'hyper-aws4'
import fetch from 'node-fetch'

const hyperEndpoint = `https://${process.env.HYPER_REGION}.hyper.sh/v1.23`

function makeContainerCommand(sourceURL, targetURL, webhookURL, authCode) {
  const commands = [
    `core ${sourceURL} ${targetURL}`,
    'EXIT_CODE=$?',
    `curl -D - -X POST -F exit_code=$EXIT_CODE -F auth_code=${authCode} ${webhookURL}`,
  ]
  return ['sh', '-c', `${commands.join(';')}`]
}

function hyperFetch(url, body, method = 'POST') {
  const headers = {
    url,
    method,
    body: JSON.stringify(body),
    credential: {
      accessKey: process.env.HYPER_ACCESS_KEY,
      secretKey: process.env.HYPER_SECRET_KEY,
    },
  }
  return fetch(headers.url, {
    method: headers.method,
    headers: aws4.sign(headers),
    body: headers.body,
  })
}

export async function createContainer(
  sourceURL,
  targetURL,
  webhookURL,
  webhookAuthCode
) {
  const containerOption = {
    Image: process.env.HYPER_IMAGE,
    Cmd: makeContainerCommand(
      sourceURL,
      targetURL,
      webhookURL,
      webhookAuthCode
    ),
    Env: [
      `AWS_ACCESS_KEY_ID=${process.env.AWS_ACCESS_KEY_ID}`,
      `AWS_SECRET_ACCESS_KEY=${process.env.AWS_SECRET_ACCESS_KEY}`,
    ],
    Labels: {
      sh_hyper_instancetype: 's4',
      'pub.vibrant.core.version': '0.1',
    },
  }

  try {
    const res = await hyperFetch(
      `${hyperEndpoint}/containers/create`,
      containerOption
    )
    const json = await res.json()
    console.log(json)
    console.log(json.Id, json.Warnings)
    return json
  } catch (err) {
    console.log('ERR', err)
    throw new Error(err)
  }
}

export async function startContainer(containerId) {
  try {
    const res = await hyperFetch(
      `${hyperEndpoint}/containers/${containerId}/start`
    )
    console.log(res.status)
    if (res.status === 204) {
      console.log('OK')
    } else {
      console.log('No')
    }
    return true
  } catch (err) {
    console.log('ERR', err)
    throw new Error(err)
  }
}

export async function deleteContainer(containerId) {
  try {
    const res = await hyperFetch(
      `${hyperEndpoint}/containers/${containerId}/remove`
    )
    console.log(res.status)
    if (res.status === 204) {
      console.log('OK')
    } else {
      console.log('No')
    }
    return true
  } catch (err) {
    console.log('ERR', err)
    throw new Error(err)
  }
}
