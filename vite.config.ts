import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 
  // !!! 중요 !!!
  // GitHub 저장소 이름에 맞게 이 값을 수정해주세요.
  // 예를 들어, 저장소 주소가 https://github.com/USER/expert-search-page 라면,
  // base 값은 '/expert-search-page/' 가 되어야 합니다.
  //
  base: '/expert-ko-passage-title-search-page/', 
})
