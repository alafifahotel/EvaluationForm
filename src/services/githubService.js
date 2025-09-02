import { Octokit } from 'octokit'
import { format } from 'date-fns'

class GitHubService {
  constructor(token) {
    this.octokit = new Octokit({
      auth: token
    })
    this.owner = 'wissamyah'
    this.repo = 'EvaluationForm'
    this.branch = 'main'
  }

  async saveEvaluation(evaluationData) {
    try {
      const date = new Date()
      const year = format(date, 'yyyy')
      const month = format(date, 'MM')
      const timestamp = date.getTime()
      
      const fileName = `eval_${evaluationData.nom.replace(/\s+/g, '_')}_${timestamp}.json`
      const path = `evaluations/${year}/${month}/${fileName}`
      
      // Ensure the directory structure exists
      await this.ensureDirectoryExists(`evaluations`)
      await this.ensureDirectoryExists(`evaluations/${year}`)
      await this.ensureDirectoryExists(`evaluations/${year}/${month}`)
      
      const content = btoa(JSON.stringify(evaluationData, null, 2))
      
      const response = await this.octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: this.owner,
        repo: this.repo,
        path: path,
        message: `Add evaluation for ${evaluationData.nom} - ${format(date, 'dd/MM/yyyy')}`,
        content: content,
        branch: this.branch
      })
      
      // Return the evaluation data with the GitHub path
      return {
        ...evaluationData,
        githubPath: path
      }
    } catch (error) {
      console.error('Error saving evaluation to GitHub:', error)
      throw error
    }
  }

  async loadEvaluations() {
    try {
      const evaluations = []
      
      // Check if evaluations directory exists
      let response
      try {
        response = await this.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner: this.owner,
          repo: this.repo,
          path: 'evaluations',
          ref: this.branch
        })
      } catch (error) {
        if (error.status === 404) {
          // Directory doesn't exist yet, return empty array
          console.log('No evaluations directory found yet')
          return []
        }
        throw error
      }
      
      // If evaluations directory exists, traverse year folders
      if (Array.isArray(response.data)) {
        for (const yearFolder of response.data) {
          if (yearFolder.type === 'dir') {
            const yearResponse = await this.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
              owner: this.owner,
              repo: this.repo,
              path: yearFolder.path,
              ref: this.branch
            })
            
            // Traverse month folders
            if (Array.isArray(yearResponse.data)) {
              for (const monthFolder of yearResponse.data) {
                if (monthFolder.type === 'dir') {
                  const monthResponse = await this.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                    owner: this.owner,
                    repo: this.repo,
                    path: monthFolder.path,
                    ref: this.branch
                  })
                  
                  // Load evaluation files
                  if (Array.isArray(monthResponse.data)) {
                    for (const file of monthResponse.data) {
                      if (file.type === 'file' && file.name.endsWith('.json')) {
                        const fileContent = await this.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                          owner: this.owner,
                          repo: this.repo,
                          path: file.path,
                          ref: this.branch
                        })
                        
                        const content = atob(fileContent.data.content)
                        const evaluation = JSON.parse(content)
                        // Add the GitHub path to the evaluation
                        evaluation.githubPath = file.path
                        evaluations.push(evaluation)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      return evaluations
    } catch (error) {
      console.error('Error loading evaluations from GitHub:', error)
      return []
    }
  }

  async updateEvaluation(path, evaluationData) {
    try {
      // First get the file to get its SHA
      const fileResponse = await this.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: this.owner,
        repo: this.repo,
        path: path,
        ref: this.branch
      })
      
      const content = btoa(JSON.stringify(evaluationData, null, 2))
      
      const response = await this.octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: this.owner,
        repo: this.repo,
        path: path,
        message: `Update evaluation for ${evaluationData.nom} - ${format(new Date(), 'dd/MM/yyyy')}`,
        content: content,
        sha: fileResponse.data.sha,
        branch: this.branch
      })
      
      return {
        ...evaluationData,
        githubPath: path
      }
    } catch (error) {
      console.error('Error updating evaluation on GitHub:', error)
      throw error
    }
  }

  async deleteEvaluation(path) {
    try {
      // First get the file to get its SHA
      const fileResponse = await this.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: this.owner,
        repo: this.repo,
        path: path,
        ref: this.branch
      })
      
      const response = await this.octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
        owner: this.owner,
        repo: this.repo,
        path: path,
        message: `Delete evaluation at ${path}`,
        sha: fileResponse.data.sha,
        branch: this.branch
      })
      
      return response.data
    } catch (error) {
      console.error('Error deleting evaluation from GitHub:', error)
      throw error
    }
  }

  async ensureDirectoryExists(path) {
    try {
      // Check if directory exists
      await this.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: this.owner,
        repo: this.repo,
        path: path,
        ref: this.branch
      })
      // Directory exists
      return true
    } catch (error) {
      if (error.status === 404) {
        // Directory doesn't exist, create it
        try {
          const placeholderPath = `${path}/.gitkeep`
          const content = btoa('')
          
          await this.octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: this.owner,
            repo: this.repo,
            path: placeholderPath,
            message: `Create directory ${path}`,
            content: content,
            branch: this.branch
          })
          
          console.log(`Created directory: ${path}`)
          return true
        } catch (createError) {
          if (createError.status === 422) {
            // File already exists, that's fine
            return true
          }
          throw createError
        }
      }
      throw error
    }
  }
}

export default GitHubService