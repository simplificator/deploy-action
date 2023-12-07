import * as core from '@actions/core'
import { execSync } from 'child_process'
import { existsSync } from 'fs'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const composeFile = core.getInput('compose-file')
    const stackName = core.getInput('stack-name')
    const sshUserAtHost = core.getInput('ssh-user-at-host')
    const sshPort = core.getInput('ssh-port')

    if (!existsSync(composeFile)) {
      core.setFailed(`Compose file ${composeFile} does not exist`)
    }

    core.info('Check if system is reachable over SSH ...')
    try {
      execSync(`ssh -o ConnectTimeout=5 -p ${sshPort} ${sshUserAtHost} exit`, {
        stdio: []
      })
    } catch (error: unknown) {
      core.setFailed(`SSH connection failed: ${error}`)
    }

    core.info('Creating docker context ...')
    execSync(
      `docker context create target --docker "host=ssh://${sshUserAtHost}:${sshPort}"`,
      { stdio: [] }
    )
    execSync(`docker context use target`, { stdio: [] })

    core.info('Initialising Swarm if required ...')
    execSync('docker node ls || docker swarm init', { stdio: [] })

    const dockerStackAwaitImage = 'sudobmitch/docker-stack-wait:v0.2.5'
    execSync(`docker pull ${dockerStackAwaitImage}`, { stdio: [] })

    core.info('Deploying stack ...')
    execSync(
      `docker stack deploy --compose-file ${composeFile} --prune --with-registry-auth ${stackName}`,
      { stdio: [] }
    )

    core.info('Waiting for deployment to complete ...')
    execSync(
      `docker run --rm -i -v $(pwd)/${composeFile}:/docker-compose.yml -v /var/run/docker.sock:/var/run/docker.sock ${dockerStackAwaitImage} -l "--since 2m" -t 120 ${stackName}`
    )

    core.info('Cleaning up ...')
    execSync('docker system prune -af', { stdio: [] })
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

export async function cleanup(): Promise<void> {
  core.info('Removing docker context ...')
  try {
    execSync('docker context remove --force target', { stdio: [] })
  } catch {
    // Ignore
  }
}
