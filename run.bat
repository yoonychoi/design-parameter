@echo off
chcp 65001 >nul
title 설계지반정수 산정 - 실행

echo ============================================
echo   설계지반정수 산정 앱 시작
echo ============================================
echo.

:: Node.js 설치 확인
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [오류] Node.js가 설치되어 있지 않습니다.
    echo.
    echo  Node.js 설치 후 다시 실행해주세요.
    echo  다운로드: https://nodejs.org  (LTS 버전 권장)
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo [확인] Node.js %NODE_VER% 설치됨

:: app 디렉토리 이동
if not exist "%~dp0app\package.json" (
    echo [오류] app\package.json 을 찾을 수 없습니다.
    echo 이 배치파일은 프로젝트 루트 폴더에서 실행해야 합니다.
    pause
    exit /b 1
)

cd /d "%~dp0app"

:: node_modules 설치 여부 확인
if not exist "node_modules" (
    echo.
    echo [설치] 패키지를 설치합니다. 잠시 기다려주세요...
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo [오류] 패키지 설치에 실패했습니다.
        pause
        exit /b 1
    )
    echo.
    echo [완료] 패키지 설치 완료
)

:: 포트 확인 후 브라우저 열기 (3초 후)
echo.
echo [시작] 개발 서버를 시작합니다...
echo        브라우저가 자동으로 열립니다.
echo        종료하려면 이 창을 닫거나 Ctrl+C 를 누르세요.
echo.

:: 백그라운드에서 3초 후 브라우저 열기
start "" cmd /c "timeout /t 3 >nul && start http://localhost:5173"

:: 개발 서버 실행
npm run dev

pause
