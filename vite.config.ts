import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const saveCodePlugin = {
  name: 'save-code-plugin',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (req.method === 'POST' && req.url === '/api/save-to-code') {
        let body = ''
        req.on('data', (chunk: any) => { body += chunk })
        req.on('end', () => {
          try {
            const data = JSON.parse(body)
            const rootDir = process.cwd()

            if (data.type === 'info') {
              // 1. Update .env file
              const envPath = path.resolve(rootDir, '.env')
              if (fs.existsSync(envPath)) {
                let envContent = fs.readFileSync(envPath, 'utf8')
                const envMap: Record<string, string> = {
                  srec_url: 'VITE_SREC_URL',
                  ieee_sb_url: 'VITE_IEEE_SB_URL',
                  snr_url: 'VITE_SNR_URL',
                  snr_trust_url: 'VITE_SNR_TRUST_URL',
                  hero_bg_url: 'VITE_HERO_BG_URL'
                }
                const envKey = envMap[data.key]
                if (envKey) {
                  const regex = new RegExp(`^${envKey}=.*`, 'm')
                  if (regex.test(envContent)) {
                    envContent = envContent.replace(regex, `${envKey}=${data.value}`)
                  } else {
                    envContent += `\n${envKey}=${data.value}`
                  }
                  fs.writeFileSync(envPath, envContent, 'utf8')
                }
              }

              // 2. Update MOCK_INFO in App.tsx
              const appPath = path.resolve(rootDir, 'src/App.tsx')
              if (fs.existsSync(appPath)) {
                let appContent = fs.readFileSync(appPath, 'utf8')
                const escapedKey = escapeRegExp(data.key)
                const regex = new RegExp(`(${escapedKey}:\\s*["'\`])[^"'\`]*?([\`"'])`, 'g')
                if (regex.test(appContent)) {
                  appContent = appContent.replace(regex, `$1${data.value}$2`)
                  fs.writeFileSync(appPath, appContent, 'utf8')
                }
              }
            } else if (data.type === 'explore_item') {
              // 3. Update ExplorePage.tsx mock array items
              const explorePath = path.resolve(rootDir, 'src/ExplorePage.tsx')
              if (fs.existsSync(explorePath)) {
                let content = fs.readFileSync(explorePath, 'utf8')
                const { name, image_url, map_url } = data

                const escapedName = escapeRegExp(name)
                const objRegex = new RegExp(`(\\{[^\\}]*?name:\\s*['"\`]${escapedName}['"\`][^\\}]*?\\})`, 's')
                const match = content.match(objRegex)
                if (match) {
                  let objStr = match[1]
                  
                  if (image_url !== undefined) {
                    if (objStr.includes('image_url:')) {
                      objStr = objStr.replace(/(image_url:\s*['"\`])[^'"\`]*?(['"\`])/, `$1${image_url}$2`)
                    } else {
                      objStr = objStr.replace(/\s*\}$/, `, image_url: '${image_url}' }`)
                    }
                  }

                  if (map_url !== undefined) {
                    if (objStr.includes('map_url:')) {
                      objStr = objStr.replace(/(map_url:\s*['"\`])[^'"\`]*?(['"\`])/, `$1${map_url}$2`)
                    } else {
                      objStr = objStr.replace(/\s*\}$/, `, map_url: '${map_url}' }`)
                    }
                  }

                  content = content.replace(objRegex, objStr)
                  fs.writeFileSync(explorePath, content, 'utf8')
                }
              }
            }

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true }))
          } catch (e: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: e.message }))
          }
        })
      } else {
        next()
      }
    })
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), saveCodePlugin],
})
