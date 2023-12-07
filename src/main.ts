import * as core from '@actions/core'
import { execSync } from 'child_process'

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

    core.info('Creating docker context ...')
    execSync(
      `docker context create target --docker "host=ssh://${sshUserAtHost}:${sshPort}"`,
      { stdio: [] }
    )
    execSync(`docker context use target`)

    core.info('Initialising Swarm if required ...')
    execSync('docker node ls || docker swarm init', { stdio: [] })

    core.info('Deploying stack ...')
    execSync(
      `docker stack deploy --compose-file ${composeFile} --prune --with-registry-auth ${stackName}`,
      { stdio: [] }
    )

    core.info('Waiting for deployment to complete ...')
    execSync(
      `docker run --rm -i -v $(pwd)/${composeFile}:/docker-compose.yml -v /var/run/docker.sock:/var/run/docker.sock sudobmitch/docker-stack-wait:v0.2.5 -l "--since 2m" -t 120 ${stackName}`,
      { stdio: [] }
    )

    core.info('Cleaning up ...')
    execSync('docker system prune -af', { stdio: [] })
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
