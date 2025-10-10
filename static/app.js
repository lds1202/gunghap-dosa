// ============================================
// 궁합도사 메인 JavaScript (정적 사이트 버전)
// ============================================

// 폼 제출 이벤트 처리
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드 완료');
    console.log('sajuAnalyzer 전역 변수:', typeof sajuAnalyzer);
    console.log('window.sajuAnalyzer:', typeof window.sajuAnalyzer);
    
    // 이름 입력 필드 - 간단하게만 처리
    const nameInputs = document.querySelectorAll('#male_name, #female_name');
    nameInputs.forEach(input => {
        input.removeAttribute('readonly');
        input.removeAttribute('disabled');
    });
    
    const form = document.getElementById('compatibilityForm');
    
    if (form) {
        console.log('폼 찾음:', form);
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 폼 검증
            if (!validateForm()) {
                return;
            }
            
            // 폼 데이터 수집
            const maleYear = document.getElementById('male_birthyear').value;
            const maleMonth = document.getElementById('male_birthmonth').value;
            const maleDay = document.getElementById('male_birthday').value;
            const maleBirthdate = `${maleYear}-${maleMonth}-${maleDay}`;
            
            const femaleYear = document.getElementById('female_birthyear').value;
            const femaleMonth = document.getElementById('female_birthmonth').value;
            const femaleDay = document.getElementById('female_birthday').value;
            const femaleBirthdate = `${femaleYear}-${femaleMonth}-${femaleDay}`;
            
            // 이름이 비어있으면 기본값 사용
            const maleName = document.getElementById('male_name').value.trim() || '남성';
            const femaleName = document.getElementById('female_name').value.trim() || '여성';
            
            const maleData = {
                name: maleName,
                birthdate: maleBirthdate,
                birthtime: document.getElementById('male_birthtime').value,
                calendar: document.querySelector('input[name="male_calendar"]:checked').value
            };
            
            const femaleData = {
                name: femaleName,
                birthdate: femaleBirthdate,
                birthtime: document.getElementById('female_birthtime').value,
                calendar: document.querySelector('input[name="female_calendar"]:checked').value
            };
            
            // 제출 버튼 비활성화
            const submitBtn = form.querySelector('.submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = '분석 중...';
            
            // Google Analytics 이벤트: 폼 제출
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submit', {
                    event_category: 'engagement',
                    event_label: '궁합 분석 시작'
                });
            }
            
            try {
                // sajuAnalyzer가 로드되었는지 확인 (여러 방법으로 시도)
                let analyzer = sajuAnalyzer || window.sajuAnalyzer;
                
                if (typeof analyzer === 'undefined') {
                    console.error('sajuAnalyzer를 찾을 수 없습니다. 전역 변수:', typeof sajuAnalyzer, 'window.sajuAnalyzer:', typeof window.sajuAnalyzer);
                    throw new Error('사주 분석 모듈이 로드되지 않았습니다. 페이지를 새로고침해주세요.');
                }
                
                console.log('sajuAnalyzer 확인됨:', analyzer);
                
                // 궁합 분석 수행
                const result = analyzer.analyzeCompatibility(maleData, femaleData);
                
                // 결과 검증
                if (!result || !result.score) {
                    throw new Error('궁합 분석 결과를 생성할 수 없습니다.');
                }
                
                console.log('분석 결과:', result); // 디버깅용
                
                // localStorage에 결과 저장
                localStorage.setItem('compatibilityResult', JSON.stringify(result));
                
                // 저장 확인
                const savedResult = localStorage.getItem('compatibilityResult');
                if (!savedResult) {
                    throw new Error('결과 저장에 실패했습니다.');
                }
                
                console.log('저장된 결과:', JSON.parse(savedResult)); // 디버깅용
                
                // 로딩 페이지로 이동
                window.location.href = 'loading.html';
            } catch (error) {
                console.error('Error:', error);
                alert('궁합 분석 중 오류가 발생했습니다: ' + error.message);
                
                // 버튼 다시 활성화
                submitBtn.disabled = false;
                submitBtn.textContent = '🔮 궁합 보기';
            }
        });
    }
});

// 폼 검증 함수
function validateForm() {
    const maleBirthyear = document.getElementById('male_birthyear').value;
    const maleBirthmonth = document.getElementById('male_birthmonth').value;
    const maleBirthday = document.getElementById('male_birthday').value;
    const maleBirthtime = document.getElementById('male_birthtime').value;
    const femaleBirthyear = document.getElementById('female_birthyear').value;
    const femaleBirthmonth = document.getElementById('female_birthmonth').value;
    const femaleBirthday = document.getElementById('female_birthday').value;
    const femaleBirthtime = document.getElementById('female_birthtime').value;
    
    // 생년월일 검증
    if (!maleBirthyear) {
        alert('남성의 생년을 선택해주세요.');
        document.getElementById('male_birthyear').focus();
        return false;
    }
    
    if (!maleBirthmonth) {
        alert('남성의 생월을 선택해주세요.');
        document.getElementById('male_birthmonth').focus();
        return false;
    }
    
    if (!maleBirthday) {
        alert('남성의 생일을 선택해주세요.');
        document.getElementById('male_birthday').focus();
        return false;
    }
    
    if (!femaleBirthyear) {
        alert('여성의 생년을 선택해주세요.');
        document.getElementById('female_birthyear').focus();
        return false;
    }
    
    if (!femaleBirthmonth) {
        alert('여성의 생월을 선택해주세요.');
        document.getElementById('female_birthmonth').focus();
        return false;
    }
    
    if (!femaleBirthday) {
        alert('여성의 생일을 선택해주세요.');
        document.getElementById('female_birthday').focus();
        return false;
    }
    
    // 태어난 시간 검증
    if (!maleBirthtime) {
        alert('남성의 태어난 시간을 선택해주세요.');
        document.getElementById('male_birthtime').focus();
        return false;
    }
    
    if (!femaleBirthtime) {
        alert('여성의 태어난 시간을 선택해주세요.');
        document.getElementById('female_birthtime').focus();
        return false;
    }
    
    // 날짜 범위 검증
    const maleDate = new Date(`${maleBirthyear}-${maleBirthmonth}-${maleBirthday}`);
    const femaleDate = new Date(`${femaleBirthyear}-${femaleBirthmonth}-${femaleBirthday}`);
    const now = new Date();
    const minDate = new Date(1950, 0, 1);
    
    if (maleDate < minDate || maleDate > now) {
        alert('남성의 생년월일이 올바르지 않습니다. (1950년 ~ 현재)');
        document.getElementById('male_birthyear').focus();
        return false;
    }
    
    if (femaleDate < minDate || femaleDate > now) {
        alert('여성의 생년월일이 올바르지 않습니다. (1950년 ~ 현재)');
        document.getElementById('female_birthyear').focus();
        return false;
    }
    
    return true;
}

// 입력 필드 포커스 효과
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
        this.parentElement.style.transition = 'transform 0.3s ease';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// 날짜 입력 필드 최대값 설정
const dateInputs = document.querySelectorAll('input[type="date"]');
if (dateInputs.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
        input.setAttribute('max', today);
        input.setAttribute('min', '1900-01-01');
    });
}

// 시간 입력 필드 기본값 설정
const timeInputs = document.querySelectorAll('input[type="time"]');
timeInputs.forEach(input => {
    input.addEventListener('focus', function() {
        if (!this.value) {
            this.value = '12:00';
        }
    }, { once: true });
});

// 이름 입력 실시간 필터링 제거 (한글 조합 문제 해결)
// 필요시 폼 제출 시점에 검증하면 충분함

// 모바일 터치 이벤트 개선
if ('ontouchstart' in window) {
    document.querySelectorAll('.submit-btn, .detail-btn, .back-btn, .home-btn, .share-btn').forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        btn.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
}

// 콘솔 환영 메시지
console.log('%c🔮 궁합도사에 오신 것을 환영합니다!', 'color: #8B5CF6; font-size: 20px; font-weight: bold;');
console.log('%c전통 사주 기반의 과학적 궁합 분석 서비스 (정적 사이트 버전)', 'color: #6B7280; font-size: 14px;');

