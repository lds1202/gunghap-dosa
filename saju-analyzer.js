/**
 * 사주 기반 궁합 분석 모듈 (JavaScript 버전)
 * 오행(五行) 상생/상극 및 일주 기반 간소화 알고리즘
 */

class SajuAnalyzer {
    constructor() {
        // 오행 정의
        this.ELEMENTS = ['木', '火', '土', '金', '水'];
        
        // 천간 (10개)
        this.CHEONGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        
        // 지지 (12개)
        this.JIJI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        
        // 천간 오행 매핑
        this.CHEONGAN_ELEMENTS = {
            '甲': '木', '乙': '木',
            '丙': '火', '丁': '火',
            '戊': '土', '己': '土',
            '庚': '金', '辛': '金',
            '壬': '水', '癸': '水'
        };
        
        // 지지 오행 매핑
        this.JIJI_ELEMENTS = {
            '寅': '木', '卯': '木',
            '巳': '火', '午': '火',
            '辰': '土', '戌': '土', '丑': '土', '未': '土',
            '申': '金', '酉': '金',
            '子': '水', '亥': '水'
        };
        
        // 오행 상생 관계
        this.ELEMENT_GENERATION = {
            '木': '火',
            '火': '土',
            '土': '金',
            '金': '水',
            '水': '木'
        };
        
        // 오행 상극 관계
        this.ELEMENT_CONFLICT = {
            '木': '土',
            '火': '金',
            '土': '水',
            '金': '木',
            '水': '火'
        };
    }
    
    /**
     * 연주(年柱) 계산
     */
    getYearPillar(year) {
        const baseYear = 1984; // 갑자년
        const yearDiff = year - baseYear;
        
        const cheonganIdx = ((yearDiff % 10) + 10) % 10;
        const jijiIdx = ((yearDiff % 12) + 12) % 12;
        
        return [this.CHEONGAN[cheonganIdx], this.JIJI[jijiIdx]];
    }
    
    /**
     * 월주(月柱) 계산
     */
    getMonthPillar(month) {
        const monthJiji = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
        const jiji = monthJiji[(month + 10) % 12];
        
        const cheonganIdx = (month * 2) % 10;
        const cheongan = this.CHEONGAN[cheonganIdx];
        
        return [cheongan, jiji];
    }
    
    /**
     * 일주(日柱) 계산
     */
    getDayPillar(date) {
        const baseDate = new Date(2000, 0, 1); // 2000년 1월 1일 (경진일)
        const baseCheonganIdx = 6; // 庚
        const baseJijiIdx = 4; // 辰
        
        const daysDiff = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));
        
        const cheonganIdx = ((baseCheonganIdx + daysDiff) % 10 + 10) % 10;
        const jijiIdx = ((baseJijiIdx + daysDiff) % 12 + 12) % 12;
        
        return [this.CHEONGAN[cheonganIdx], this.JIJI[jijiIdx]];
    }
    
    /**
     * 시주(時柱) 계산
     */
    getTimePillar(hour) {
        const timeJiji = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        const jijiIdx = Math.floor((hour + 1) / 2) % 12;
        const jiji = timeJiji[jijiIdx];
        
        const cheonganIdx = Math.floor(hour / 2) % 10;
        const cheongan = this.CHEONGAN[cheonganIdx];
        
        return [cheongan, jiji];
    }
    
    /**
     * 사주팔자 계산
     */
    calculateSaju(birthdate, birthtime, calendarType = 'solar') {
        // 날짜 파싱
        const birthDate = new Date(birthdate);
        
        // 사주 계산
        const [yearCheongan, yearJiji] = this.getYearPillar(birthDate.getFullYear());
        const [monthCheongan, monthJiji] = this.getMonthPillar(birthDate.getMonth() + 1);
        const [dayCheongan, dayJiji] = this.getDayPillar(birthDate);
        
        // 시간 파싱 - 'unknown' 처리
        let timeCheongan, timeJiji;
        if (birthtime === 'unknown') {
            // 시간을 모를 경우 빈 값으로 설정
            timeCheongan = '';
            timeJiji = '';
        } else {
            const timeParts = birthtime.split(':');
            const hour = parseInt(timeParts[0]);
            [timeCheongan, timeJiji] = this.getTimePillar(hour);
        }
        
        return {
            year: [yearCheongan, yearJiji],
            month: [monthCheongan, monthJiji],
            day: [dayCheongan, dayJiji],
            time: [timeCheongan, timeJiji],
            timeUnknown: birthtime === 'unknown'
        };
    }
    
    /**
     * 오행 추출
     */
    getElement(cheongan, jiji) {
        const cheonganElement = this.CHEONGAN_ELEMENTS[cheongan] || '土';
        const jijiElement = this.JIJI_ELEMENTS[jiji] || '土';
        return [cheonganElement, jijiElement];
    }
    
    /**
     * 오행 관계 확인
     */
    checkElementRelationship(elem1, elem2) {
        if (elem1 === elem2) {
            return ['same', 70];
        } else if (this.ELEMENT_GENERATION[elem1] === elem2 || this.ELEMENT_GENERATION[elem2] === elem1) {
            return ['generation', 85];
        } else if (this.ELEMENT_CONFLICT[elem1] === elem2 || this.ELEMENT_CONFLICT[elem2] === elem1) {
            return ['conflict', 45];
        } else {
            return ['neutral', 60];
        }
    }
    
    /**
     * 사주의 오행 개수 세기
     */
    countElements(saju) {
        const elementCount = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
        
        // 연주
        const [yearCheongan, yearJiji] = saju.year;
        elementCount[this.CHEONGAN_ELEMENTS[yearCheongan]]++;
        elementCount[this.JIJI_ELEMENTS[yearJiji]]++;
        
        // 월주
        const [monthCheongan, monthJiji] = saju.month;
        elementCount[this.CHEONGAN_ELEMENTS[monthCheongan]]++;
        elementCount[this.JIJI_ELEMENTS[monthJiji]]++;
        
        // 일주
        const [dayCheongan, dayJiji] = saju.day;
        elementCount[this.CHEONGAN_ELEMENTS[dayCheongan]]++;
        elementCount[this.JIJI_ELEMENTS[dayJiji]]++;
        
        // 시주
        const [timeCheongan, timeJiji] = saju.time;
        elementCount[this.CHEONGAN_ELEMENTS[timeCheongan]]++;
        elementCount[this.JIJI_ELEMENTS[timeJiji]]++;
        
        return elementCount;
    }
    
    /**
     * 가장 부족한 오행과 가장 강한 오행 찾기
     */
    findWeakestAndStrongest(elementCount) {
        let weakest = { element: '木', count: 8 };
        let strongest = { element: '木', count: 0 };
        
        for (const [element, count] of Object.entries(elementCount)) {
            if (count < weakest.count) {
                weakest = { element, count };
            }
            if (count > strongest.count) {
                strongest = { element, count };
            }
        }
        
        return { weakest, strongest };
    }
    
    /**
     * 궁합 분석 메인 함수
     */
    analyzeCompatibility(maleData, femaleData) {
        const { name: maleName, birthdate: maleBirthdate, birthtime: maleBirthtime, calendar: maleCalendar } = maleData;
        const { name: femaleName, birthdate: femaleBirthdate, birthtime: femaleBirthtime, calendar: femaleCalendar } = femaleData;
        
        // 사주 계산
        const maleSaju = this.calculateSaju(maleBirthdate, maleBirthtime, maleCalendar);
        const femaleSaju = this.calculateSaju(femaleBirthdate, femaleBirthtime, femaleCalendar);
        
        // 일주(日柱) 기반 궁합
        const [maleDayCheongan, maleDayJiji] = maleSaju.day;
        const [femaleDayCheongan, femaleDayJiji] = femaleSaju.day;
        
        const [maleDayElemCheongan, maleDayElemJiji] = this.getElement(maleDayCheongan, maleDayJiji);
        const [femaleDayElemCheongan, femaleDayElemJiji] = this.getElement(femaleDayCheongan, femaleDayJiji);
        
        // 천간 관계 점수
        const [cheonganRel, cheonganScore] = this.checkElementRelationship(maleDayElemCheongan, femaleDayElemCheongan);
        
        // 지지 관계 점수
        const [jijiRel, jijiScore] = this.checkElementRelationship(maleDayElemJiji, femaleDayElemJiji);
        
        // 연주 관계 점수
        const [maleYearCheongan, maleYearJiji] = maleSaju.year;
        const [femaleYearCheongan, femaleYearJiji] = femaleSaju.year;
        
        const [maleYearElemCheongan] = this.getElement(maleYearCheongan, maleYearJiji);
        const [femaleYearElemCheongan] = this.getElement(femaleYearCheongan, femaleYearJiji);
        
        const [yearRel, yearScore] = this.checkElementRelationship(maleYearElemCheongan, femaleYearElemCheongan);
        
        // 월주 관계 점수 추가
        const [maleMonthCheongan, maleMonthJiji] = maleSaju.month;
        const [femaleMonthCheongan, femaleMonthJiji] = femaleSaju.month;
        
        const [maleMonthElemCheongan] = this.getElement(maleMonthCheongan, maleMonthJiji);
        const [femaleMonthElemCheongan] = this.getElement(femaleMonthCheongan, femaleMonthJiji);
        
        const [monthRel, monthScore] = this.checkElementRelationship(maleMonthElemCheongan, femaleMonthElemCheongan);
        
        // 시간 정보가 '모름'인 경우 점수 계산 방식 조정
        const maleTimeUnknown = maleSaju.timeUnknown || false;
        const femaleTimeUnknown = femaleSaju.timeUnknown || false;
        const hasUnknownTime = maleTimeUnknown || femaleTimeUnknown;
        
        // 시주 관계 점수 추가 (시간을 알 경우만)
        let timeRel = 'unknown';
        let timeScore = 60; // 기본값
        
        if (!maleTimeUnknown && !femaleTimeUnknown) {
            const [maleTimeCheongan, maleTimeJiji] = maleSaju.time;
            const [femaleTimeCheongan, femaleTimeJiji] = femaleSaju.time;
            
            const [maleTimeElemCheongan] = this.getElement(maleTimeCheongan, maleTimeJiji);
            const [femaleTimeElemCheongan] = this.getElement(femaleTimeCheongan, femaleTimeJiji);
            
            [timeRel, timeScore] = this.checkElementRelationship(maleTimeElemCheongan, femaleTimeElemCheongan);
        }
        
        // 종합 점수 계산
        let totalScore;
        if (hasUnknownTime) {
            // 시간을 모를 경우: 일주 50%, 월주 30%, 연주 20% (시주 제외)
            totalScore = Math.round(
                cheonganScore * 0.5 + 
                monthScore * 0.3 + 
                yearScore * 0.2
            );
        } else {
            // 시간을 알 경우: 일주 40%, 월주 25%, 연주 20%, 시주 15%
            totalScore = Math.round(
                cheonganScore * 0.4 + 
                monthScore * 0.25 + 
                yearScore * 0.2 + 
                timeScore * 0.15
            );
        }
        
        // 신뢰성을 위해 랜덤성 제거 - 동일한 입력에 대해 항상 같은 결과
        totalScore = Math.min(100, Math.max(0, totalScore));
        
        // 요약 풀이 생성
        const summary = this.generateSummary(totalScore, maleName, femaleName, cheonganRel, jijiRel);
        
        // 상세 풀이 생성
        const details = this.generateDetails(totalScore, maleName, femaleName, maleDayElemCheongan, femaleDayElemCheongan, cheonganRel, jijiRel, monthRel, timeRel);
        
        // 오행 분석 (단점 보완법용)
        const maleElementCount = this.countElements(maleSaju);
        const femaleElementCount = this.countElements(femaleSaju);
        
        const maleAnalysis = this.findWeakestAndStrongest(maleElementCount);
        const femaleAnalysis = this.findWeakestAndStrongest(femaleElementCount);
        
        // 단점 보완법 생성
        const complement = this.generateComplement(maleName, femaleName, maleAnalysis, femaleAnalysis, maleElementCount, femaleElementCount);
        
        return {
            score: totalScore,
            maleName: maleName,
            femaleName: femaleName,
            summary: summary,
            details: details,
            maleSaju: {
                year: `${maleYearCheongan}${maleYearJiji}`,
                month: `${maleMonthCheongan}${maleMonthJiji}`,
                day: `${maleDayCheongan}${maleDayJiji}`,
                time: maleTimeUnknown ? '모름' : (maleSaju.time[0] && maleSaju.time[1] ? `${maleSaju.time[0]}${maleSaju.time[1]}` : '모름')
            },
            femaleSaju: {
                year: `${femaleYearCheongan}${femaleYearJiji}`,
                month: `${femaleMonthCheongan}${femaleMonthJiji}`,
                day: `${femaleDayCheongan}${femaleDayJiji}`,
                time: femaleTimeUnknown ? '모름' : (femaleSaju.time[0] && femaleSaju.time[1] ? `${femaleSaju.time[0]}${femaleSaju.time[1]}` : '모름')
            },
            complement: complement,
            timeInfo: {
                maleTimeUnknown: maleTimeUnknown,
                femaleTimeUnknown: femaleTimeUnknown,
                hasUnknownTime: hasUnknownTime,
                timeAccuracy: hasUnknownTime ? '출생 시간 정보가 없어 일주, 월주, 연주 기반으로 분석했습니다. 시주(時柱) 정보가 없어 자녀운 분석의 정확도가 제한될 수 있습니다.' : '사주팔자 전체 정보를 바탕으로 분석했습니다.'
            }
        };
    }
    
    /**
     * 단점 보완법 생성
     */
    generateComplement(maleName, femaleName, maleAnalysis, femaleAnalysis, maleElementCount, femaleElementCount) {
        const elementInfo = {
            '木': {
                name: '목(木)',
                health: '간장, 담낭, 눈, 근육',
                mental: '성장력, 결단력, 추진력, 창의성'
            },
            '火': {
                name: '화(火)',
                health: '심장, 소장, 눈, 혈관',
                mental: '사교력, 친화력, 표현력, 열정'
            },
            '土': {
                name: '토(土)',
                health: '비장, 위장, 소화기',
                mental: '신중함, 안정성, 신뢰감, 포용력'
            },
            '金': {
                name: '금(金)',
                health: '폐, 대장, 코, 피부',
                mental: '판단력, 결단력, 강인함, 냉철함'
            },
            '水': {
                name: '수(水)',
                health: '신장, 방광, 귀, 생식기',
                mental: '지혜, 유연성, 적응력, 통찰력'
            }
        };
        
        // 남성의 부족한 오행을 여성이 보완해주는지 분석
        const maleWeakElement = maleAnalysis.weakest.element;
        const femaleStrongElement = femaleAnalysis.strongest.element;
        const femaleHasWeakElement = femaleElementCount[maleWeakElement];
        
        // 여성의 부족한 오행을 남성이 보완해주는지 분석
        const femaleWeakElement = femaleAnalysis.weakest.element;
        const maleStrongElement = maleAnalysis.strongest.element;
        const maleHasWeakElement = maleElementCount[femaleWeakElement];
        
        // 보완력 계산
        function getComplementPower(weakElement, partnerCount, partnerStrongElement) {
            if (partnerCount >= 3) return '상급';
            if (partnerCount === 2) return '중상급';
            if (partnerCount === 1) {
                // 상생 관계인지 확인
                const generation = {
                    '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
                };
                if (generation[partnerStrongElement] === weakElement) {
                    return '중급';
                }
                return '중하급';
            }
            return '하급';
        }
        
        const maleComplementPower = getComplementPower(maleWeakElement, femaleHasWeakElement, femaleStrongElement);
        const femaleComplementPower = getComplementPower(femaleWeakElement, maleHasWeakElement, maleStrongElement);
        
        // 남성 보완법
        let maleComplement = `【 ${maleName}님의 단점 보완 】\n\n`;
        maleComplement += `${maleName}님의 사주에서 가장 부족한 오행은 ${elementInfo[maleWeakElement].name}입니다. `;
        maleComplement += `${elementInfo[maleWeakElement].name}는 건강상 ${elementInfo[maleWeakElement].health}에 해당하고, `;
        maleComplement += `정신적인 면으로는 ${elementInfo[maleWeakElement].mental} 등에 해당하는데, `;
        maleComplement += `${maleName}님의 사주에는 ${elementInfo[maleWeakElement].name}가 부족하기 때문에 건강상 해당 부위가 약하거나 `;
        maleComplement += `${elementInfo[maleWeakElement].mental.split(',')[0].trim()}이(가) ${elementInfo[maleWeakElement].name}가 적당히 있는 사람에 비해 다소 떨어질 수 있습니다.\n\n`;
        
        if (femaleHasWeakElement >= 2) {
            maleComplement += `다행히 ${femaleName}님의 사주에 ${elementInfo[maleWeakElement].name}가 ${femaleHasWeakElement}개나 있어서 `;
            maleComplement += `${maleName}님의 부족한 부분을 충분히 보완해줄 수 있는 좋은 배우자입니다. `;
            maleComplement += `${femaleName}님과 정신적, 육체적으로 밀접한 관계를 유지하면 할수록 이 약점이 보완될 뿐만 아니라 `;
            maleComplement += `좋은 운세를 불러오는 데에도 많은 영향을 발휘하게 됩니다.\n\n`;
        } else if (femaleHasWeakElement === 1) {
            maleComplement += `${femaleName}님의 사주에 ${elementInfo[maleWeakElement].name}가 ${femaleHasWeakElement}개 있어 `;
            maleComplement += `${maleName}님과 함께 생활하면서 건강에 대한 약점뿐만 아니라 성격의 단점을 서서히 보완해줄 수 있는 배우자입니다. `;
            maleComplement += `보완력이 완벽하지는 않지만, 장기적으로 긍정적인 영향을 줄 수 있습니다.\n\n`;
        } else {
            maleComplement += `아쉽게도 ${femaleName}님의 사주에도 ${elementInfo[maleWeakElement].name}가 부족합니다. `;
            maleComplement += `이 경우, 일상생활에서 ${elementInfo[maleWeakElement].name}를 보충하는 방법을 찾는 것이 좋습니다. `;
            maleComplement += `예를 들어, ${maleWeakElement === '木' ? '동쪽 방향의 활동, 녹색 계열 색상 활용' : ''}`;
            maleComplement += `${maleWeakElement === '火' ? '남쪽 방향의 활동, 붉은색 계열 색상 활용, 사회 활동 증가' : ''}`;
            maleComplement += `${maleWeakElement === '土' ? '중앙 방향 중시, 황색 계열 색상 활용, 안정적인 생활 패턴 유지' : ''}`;
            maleComplement += `${maleWeakElement === '金' ? '서쪽 방향의 활동, 흰색·금색 계열 색상 활용' : ''}`;
            maleComplement += `${maleWeakElement === '水' ? '북쪽 방향의 활동, 검정색·파란색 계열 색상 활용, 지적 활동 증가' : ''}`;
            maleComplement += ` 등이 도움이 될 수 있습니다.\n\n`;
        }
        
        maleComplement += `💡 결점 보완력: ${maleComplementPower}`;
        
        // 여성 보완법
        let femaleComplement = `【 ${femaleName}님의 단점 보완 】\n\n`;
        femaleComplement += `${femaleName}님의 사주에서 가장 부족한 오행은 ${elementInfo[femaleWeakElement].name}입니다. `;
        femaleComplement += `${elementInfo[femaleWeakElement].name}는 건강상 ${elementInfo[femaleWeakElement].health}에 해당하고, `;
        femaleComplement += `정신적인 면으로는 ${elementInfo[femaleWeakElement].mental} 등에 해당하는데, `;
        femaleComplement += `${femaleName}님의 사주에는 ${elementInfo[femaleWeakElement].name}가 부족하기 때문에 건강상 해당 부위가 약하거나 `;
        femaleComplement += `${elementInfo[femaleWeakElement].mental.split(',')[0].trim()}이(가) ${elementInfo[femaleWeakElement].name}가 적당히 있는 사람에 비해 다소 떨어질 수 있습니다.\n\n`;
        
        if (maleHasWeakElement >= 2) {
            femaleComplement += `다행히 ${maleName}님의 사주에 ${elementInfo[femaleWeakElement].name}가 ${maleHasWeakElement}개나 있어서 `;
            femaleComplement += `${femaleName}님의 부족한 부분을 충분히 보완해줄 수 있는 좋은 배우자입니다. `;
            femaleComplement += `${maleName}님과 정신적, 육체적으로 밀접한 관계를 유지하면 할수록 이 약점이 보완될 뿐만 아니라 `;
            femaleComplement += `좋은 운세를 불러오는 데에도 많은 영향을 발휘하게 됩니다.\n\n`;
        } else if (maleHasWeakElement === 1) {
            femaleComplement += `${maleName}님의 사주에 ${elementInfo[femaleWeakElement].name}가 ${maleHasWeakElement}개 있어 `;
            femaleComplement += `${femaleName}님과 함께 생활하면서 건강에 대한 약점뿐만 아니라 성격의 단점을 서서히 보완해줄 수 있는 배우자입니다. `;
            femaleComplement += `보완력이 완벽하지는 않지만, 장기적으로 긍정적인 영향을 줄 수 있습니다.\n\n`;
        } else {
            femaleComplement += `아쉽게도 ${maleName}님의 사주에도 ${elementInfo[femaleWeakElement].name}가 부족합니다. `;
            femaleComplement += `이 경우, 일상생활에서 ${elementInfo[femaleWeakElement].name}를 보충하는 방법을 찾는 것이 좋습니다. `;
            femaleComplement += `예를 들어, ${femaleWeakElement === '木' ? '동쪽 방향의 활동, 녹색 계열 색상 활용' : ''}`;
            femaleComplement += `${femaleWeakElement === '火' ? '남쪽 방향의 활동, 붉은색 계열 색상 활용, 사회 활동 증가' : ''}`;
            femaleComplement += `${femaleWeakElement === '土' ? '중앙 방향 중시, 황색 계열 색상 활용, 안정적인 생활 패턴 유지' : ''}`;
            femaleComplement += `${femaleWeakElement === '金' ? '서쪽 방향의 활동, 흰색·금색 계열 색상 활용' : ''}`;
            femaleComplement += `${femaleWeakElement === '水' ? '북쪽 방향의 활동, 검정색·파란색 계열 색상 활용, 지적 활동 증가' : ''}`;
            femaleComplement += ` 등이 도움이 될 수 있습니다.\n\n`;
        }
        
        femaleComplement += `💡 결점 보완력: ${femaleComplementPower}`;
        
        return {
            male: maleComplement,
            female: femaleComplement
        };
    }
    
    /**
     * 요약 풀이 생성
     */
    generateSummary(score, maleName, femaleName, cheonganRel, jijiRel) {
        if (score >= 85) {
            return `${maleName}님과 ${femaleName}님은 천생연분입니다! 💕 서로의 기운이 완벽하게 조화를 이루며, 함께할 때 큰 시너지를 발휘할 수 있는 최고의 궁합입니다.`;
        } else if (score >= 70) {
            return `${maleName}님과 ${femaleName}님은 매우 좋은 궁합입니다! 🌟 서로를 이해하고 배려하는 마음으로 아름다운 관계를 만들어갈 수 있습니다.`;
        } else if (score >= 55) {
            return `${maleName}님과 ${femaleName}님은 평범한 궁합입니다. 😊 서로 다른 면이 있어 갈등이 있을 수 있으나, 이해와 노력으로 극복 가능합니다.`;
        } else if (score >= 40) {
            return `${maleName}님과 ${femaleName}님은 다소 어려운 궁합입니다. ⚠️ 성격과 가치관 차이로 인한 갈등이 빈번할 수 있으며, 각별한 노력이 필요합니다.`;
        } else {
            return `${maleName}님과 ${femaleName}님은 상극한 궁합입니다. 🔥 사주상 큰 갈등과 어려움이 예상되며, 관계 유지에 많은 인내와 이해가 필요합니다.`;
        }
    }
    
    /**
     * 상세 풀이 생성
     */
    generateDetails(score, maleName, femaleName, maleElement, femaleElement, cheonganRel, jijiRel, monthRel, timeRel) {
        const details = {};
        
        // 오행 관계 설명 생성
        const elementDescription = this.getElementRelationshipDescription(maleElement, femaleElement, cheonganRel);
        const monthDescription = this.getRelationshipDescription(monthRel, '월주');
        const timeDescription = this.getRelationshipDescription(timeRel, '시주');
        
        // 1. 애정운 (일주 + 월주 중심)
        if (score >= 80) {
            details.love = `【애정운 분석】\n\n${maleName}님과 ${femaleName}님의 일주 오행은 ${elementDescription} 이는 두 분의 감정이 자연스럽게 통하며, 서로에게 깊은 애정을 느낄 수 있는 천생연분의 궁합입니다.\n\n${monthDescription} 이러한 조합은 연애 시기에 뜨겁고 열정적인 사랑을 나누며, 결혼 후에도 변함없는 애정을 유지할 수 있는 최상의 배치입니다.\n\n💡 조언: 서로를 향한 마음이 식지 않도록 꾸준한 데이트와 애정 표현을 잊지 마세요. 기념일을 챙기고 작은 선물로 사랑을 전한다면 백년해로할 수 있습니다.`;
        } else if (score >= 60) {
            details.love = `【애정운 분석】\n\n${maleName}님과 ${femaleName}님의 사주를 보면 ${elementDescription} 처음의 불꽃같은 열정은 다소 부족할 수 있으나, 이는 오히려 안정적이고 오래가는 사랑의 기반이 됩니다.\n\n${monthDescription} 이러한 조합은 급하게 타오르는 사랑보다는 천천히 깊어지는 애정을 의미합니다. 시간이 지날수록 서로의 소중함을 깨닫게 되는 궁합입니다.\n\n💡 조언: 서두르지 말고 서로를 깊이 이해하는 시간을 가지세요. 함께하는 일상 속에서 작은 행복을 찾는다면 평생의 동반자가 될 수 있습니다.`;
        } else {
            details.love = `【애정운 분석】\n\n${maleName}님과 ${femaleName}님의 사주에서 ${elementDescription} 이는 두 분의 사랑 표현 방식과 감정의 온도에 차이가 있을 수 있음을 의미합니다.\n\n${monthDescription} 하지만 이러한 차이는 서로를 더 깊이 이해하고 성장하는 계기가 될 수 있습니다.\n\n💡 조언: 감정을 숨기지 말고 솔직하게 표현하세요. 상대방의 애정 표현 방식을 이해하고 존중한다면 충분히 좋은 관계로 발전할 수 있습니다. 정기적인 대화 시간을 갖는 것을 추천합니다.`;
        }
        
        // 2. 재물운 (천간 + 연주 중심)
        if (cheonganRel === 'generation' || score >= 75) {
            details.wealth = `【재물운 분석】\n\n두 분의 사주에서 천간(天干) 오행이 상생(相生) 관계를 이루고 있습니다. ${maleElement} 오행과 ${femaleElement} 오행이 서로 도우며, 이는 재물이 자연스럽게 모이고 증식되는 길한 배치입니다.\n\n특히 ${maleName}님과 ${femaleName}님이 함께 사업을 하거나 투자를 한다면 시너지 효과가 뛰어나 큰 성공을 거둘 수 있습니다. 부동산, 금융, 창업 등 다양한 분야에서 좋은 기회를 잡을 수 있는 궁합입니다.\n\n💰 재테크 조언: 한 사람이 공격적 투자, 다른 사람이 안정적 저축을 담당하는 역할 분담이 효과적입니다. 단, 과욕은 금물이며 분수에 맞는 소비 습관을 유지하세요.`;
        } else if (score >= 55) {
            details.wealth = `【재물운 분석】\n\n두 분의 재물운은 평범하지만 안정적입니다. 사주상 큰 돈을 벌기보다는 꾸준히 저축하고 모으는 것이 유리한 배치입니다. 갑작스러운 횡재나 대박은 기대하기 어렵지만, 성실하게 일하고 검소하게 생활한다면 노후까지 걱정 없는 삶을 살 수 있습니다.\n\n${maleName}님과 ${femaleName}님이 함께 재정 계획을 세우고 실천한다면, 중년 이후 안정적인 경제 상황을 만들 수 있습니다. 무리한 대출이나 투자는 피하고, 안전한 자산 관리를 추천합니다.\n\n💰 재테크 조언: 매월 고정 금액을 저축하고, 비상금을 마련하세요. 부동산보다는 예적금이나 연금상품이 유리합니다.`;
        } else {
            details.wealth = `【재물운 분석】\n\n사주상 재물운에 다소 주의가 필요한 배치입니다. 두 분의 금전 관리 방식이나 소비 성향에 차이가 있을 수 있으며, 이로 인한 갈등이 발생할 수 있습니다. 한 사람은 아끼려 하고 다른 사람은 쓰려는 경향이 있다면 반드시 합의가 필요합니다.\n\n충동구매나 과소비를 자제하고, 가계부를 작성하여 지출을 투명하게 관리하는 것이 중요합니다. 큰 금액이 드는 결정은 반드시 함께 상의하세요.\n\n💰 재테크 조언: 공동 계좌와 개인 계좌를 분리하여 관리하고, 정기적으로 재정 회의를 가지세요. 투자보다는 저축 위주의 재테크가 안전합니다.`;
        }
        
        // 3. 건강운 (지지 + 시주 중심)
        if (jijiRel === 'generation' || score >= 70) {
            details.health = `【건강운 분석】\n\n사주의 지지(地支) 오행이 조화를 이루고 있어 건강운이 매우 길합니다. ${timeDescription} 이는 두 분이 함께할 때 정신적으로 안정되고 신체적으로도 건강을 유지할 수 있음을 의미합니다.\n\n특히 결혼 후 서로가 서로에게 좋은 영향을 주어 면역력이 강화되고 질병에 대한 저항력이 높아집니다. 스트레스를 함께 풀고 긍정적인 에너지를 주고받으며 건강한 생활을 영위할 수 있습니다.\n\n🏥 건강 조언: 함께 운동하는 습관을 들이세요. 등산, 산책, 요가 등이 좋으며, 규칙적인 식사와 충분한 수면이 중요합니다. 부부가 함께 건강검진을 받는 것도 추천합니다.`;
        } else if (score >= 50) {
            details.health = `【건강운 분석】\n\n건강운은 전체적으로 무난한 편입니다. 사주상 큰 질병이나 사고는 없으나, 일상적인 스트레스 관리가 중요합니다. ${timeDescription}\n\n부부 간의 갈등이나 걱정거리가 있을 때 건강에 영향을 줄 수 있으니, 서로를 위로하고 지지하는 것이 중요합니다. 소소한 대화와 공감이 정신 건강의 비결입니다.\n\n🏥 건강 조언: 정기적인 건강검진을 받고, 과로를 피하세요. 소화기 계통과 신경계 건강에 신경 쓰고, 취미 생활로 스트레스를 해소하세요. 충분한 휴식이 중요합니다.`;
        } else {
            details.health = `【건강운 분석】\n\n사주상 건강운에 다소 주의가 필요합니다. 부부 간의 불화나 스트레스가 신체 건강에 직접적인 영향을 줄 수 있는 배치입니다. 특히 소화기, 순환기, 호흡기 계통에 주의가 필요합니다.\n\n${timeDescription} 갈등이 생겼을 때 참지 말고 대화로 풀어야 건강을 지킬 수 있습니다. 화병이나 우울증 예방을 위해 정서적 안정이 중요합니다.\n\n🏥 건강 조언: 규칙적인 생활 패턴을 유지하고, 술과 담배를 멀리하세요. 스트레스 관리가 가장 중요하며, 요가나 명상 같은 심신 안정 활동을 추천합니다. 6개월마다 건강검진을 받으세요.`;
        }
        
        // 4. 자녀운 (사주 전체 조화)
        const timeInfoNote = this.getTimeInfoNote(timeRel, maleName, femaleName);
        
        if (score >= 75) {
            details.children = `【자녀운 분석】\n\n사주팔자의 전체적인 조화가 뛰어나 자녀운이 매우 길합니다. 임신과 출산이 순조로우며, 건강하고 총명한 자녀를 얻을 수 있는 사주입니다. 자녀복이 두터워 노년에 큰 효도를 받을 수 있습니다.\n\n${maleName}님과 ${femaleName}님 모두 부모로서의 자질이 훌륭하며, 자녀 교육에서도 탁월한 성과를 거둘 수 있습니다. 특히 자녀가 학업이나 사회생활에서 성공할 가능성이 높으며, 부모 자식 간의 정이 깊어 평생 좋은 관계를 유지합니다.\n\n${timeInfoNote}\n\n👶 육아 조언: 사랑과 존중으로 자녀를 대하되, 적절한 훈육도 필요합니다. 자녀의 재능을 일찍 발견하고 키워주세요. 부부가 교육관을 통일하는 것이 중요합니다.`;
        } else if (score >= 55) {
            details.children = `【자녀운 분석】\n\n자녀운은 평범하지만 안정적입니다. 자녀와의 관계에서 간혹 세대 차이로 인한 갈등이 있을 수 있으나, 대화와 이해로 충분히 풀어갈 수 있습니다. 자녀에게 과도한 기대를 걸기보다는 있는 그대로를 인정하고 격려하는 것이 중요합니다.\n\n사주상 자녀가 부모의 뜻대로 따라주지 않을 수 있으나, 이는 자녀의 독립성과 자주성이 강하다는 의미입니다. 억압하기보다는 존중하고 믿어주는 것이 좋은 관계의 비결입니다.\n\n${timeInfoNote}\n\n👶 육아 조언: 자녀와 자주 대화하고 관심을 보이세요. 비교하지 말고 칭찬을 많이 해주세요. 부부가 서로 다른 교육 방식을 보이면 자녀가 혼란스러워하니 사전 합의가 중요합니다.`;
        } else {
            details.children = `【자녀운 분석】\n\n자녀운에서 인내와 노력이 필요한 배치입니다. 임신이나 육아 과정에서 어려움이 있을 수 있으며, 자녀와의 소통에도 각별한 주의가 필요합니다. 사주상 부모와 자녀 간의 성향 차이가 클 수 있어 이해와 포용이 중요합니다.\n\n자녀가 반항기를 겪거나 의견 충돌이 있을 때, 감정적으로 대응하지 말고 이성적으로 접근해야 합니다. 어린 시절부터 꾸준한 애정 표현과 스킨십으로 유대감을 쌓는 것이 중요합니다.\n\n${timeInfoNote}\n\n👶 육아 조언: 체벌보다는 대화로 훈육하세요. 부부가 교육 방식을 통일하고 일관성을 유지하세요. 자녀의 말에 귀 기울이고, 부모의 생각을 강요하지 마세요. 전문가의 도움을 받는 것도 좋습니다.`;
        }
        
        // 5. 궁합 총평 (사주팔자 종합 분석)
        if (score >= 85) {
            details.overall = `【궁합 총평】\n\n🎊 축하합니다! ${maleName}님과 ${femaleName}님은 천생연분(天生緣分)의 최상급 궁합입니다.\n\n사주팔자의 연주(年柱), 월주(月柱), 일주(日柱), 시주(時柱)가 모두 조화롭게 배치되어 있습니다. ${elementDescription} 이는 하늘이 정해준 인연으로, 전생의 깊은 인연이 이번 생에 다시 만난 것으로 해석됩니다.\n\n두 분은 서로의 장점은 배가되고 단점은 보완되는 완벽한 조합입니다. 금슬이 좋고 해로(偕老)할 수 있으며, 가정을 이루면 가화만사성(家和萬事成)의 길복(吉福)이 가득합니다. 가끔 찾아오는 시련도 둘이 힘을 합치면 오히려 더 강해지는 전화위복(轉禍爲福)의 운세입니다.\n\n✨ 조언: 이 좋은 인연을 소중히 여기고 감사하는 마음을 잊지 마세요. 서로에 대한 존중과 배려를 유지한다면 백년해로(百年偕老)할 수 있습니다.`;
        } else if (score >= 70) {
            details.overall = `【궁합 총평】\n\n${maleName}님과 ${femaleName}님은 매우 좋은 궁합으로, 상생지복(相生之福)의 인연입니다.\n\n사주팔자를 종합적으로 분석한 결과, 대부분의 주(柱)가 조화롭게 배치되어 있습니다. 완벽한 궁합은 아니지만, 서로에 대한 이해와 배려가 깊어질수록 더욱 행복한 관계로 발전할 수 있습니다.\n\n때로는 의견 차이나 작은 갈등이 있을 수 있으나, 이는 두 사람이 서로 다른 개성을 가진 독립적인 존재라는 자연스러운 현상입니다. 대화와 타협으로 풀어간다면 오래도록 행복한 시간을 보낼 수 있으며, 중년 이후 더욱 깊은 정이 쌓입니다.\n\n✨ 조언: 상대방의 입장에서 생각하는 습관을 들이세요. 작은 배려와 관심이 큰 사랑을 만듭니다.`;
        } else if (score >= 55) {
            details.overall = `【궁합 총평】\n\n두 분의 궁합은 중간 정도로, 평범하지만 노력과 이해로 충분히 좋은 관계를 만들 수 있습니다.\n\n사주상 일부 주(柱)에서 충(沖)이나 극(剋)의 기운이 있어 가끔 어려움이 있을 수 있습니다. 하지만 이는 극복 불가능한 것이 아니며, 오히려 서로를 더 깊이 이해하고 성장하는 계기가 될 수 있습니다.\n\n서로 다른 점을 단점이 아닌 다양성으로 받아들이고, 함께 성장하는 자세가 필요합니다. 급하게 서두르지 말고 천천히 관계를 쌓아가며, 신뢰를 바탕으로 한다면 평생의 반려자가 될 수 있습니다.\n\n✨ 조언: 갈등이 생겼을 때 회피하지 말고 정면으로 대화하세요. 사랑과 인내심을 가지고 관계를 가꾸어 나가세요.`;
        } else if (score >= 40) {
            details.overall = `【궁합 총평】\n\n${maleName}님과 ${femaleName}님은 사주상 다소 어려운 궁합입니다.\n\n사주팔자를 보면 상당 부분에서 상극(相剋)이나 충(沖)의 기운이 있어 갈등이나 의견 차이가 빈번할 수 있습니다. 성격, 가치관, 생활 방식에서 큰 차이를 느낄 수 있으며, 이로 인한 스트레스와 갈등이 예상됩니다.\n\n특히 경제관념, 가족관, 자녀교육 등 중요한 부분에서 의견 충돌이 있을 수 있으며, 서로를 이해하기 어려운 상황이 자주 발생할 수 있습니다. 하지만 진정한 사랑과 각별한 노력이 있다면 관계를 유지할 수 있습니다.\n\n⚠️ 주의사항: 감정적인 대응보다는 이성적인 대화가 필요합니다. 상대방을 바꾸려 하지 말고 있는 그대로 받아들이는 자세가 중요합니다. 전문 상담사의 도움을 적극적으로 고려해보세요.`;
        } else {
            details.overall = `【궁합 총평】\n\n${maleName}님과 ${femaleName}님은 사주상 상극한 궁합으로, 관계 유지에 많은 어려움이 예상됩니다.\n\n사주팔자를 종합적으로 보면 대부분의 주(柱)에서 상극(相剋)이나 충(沖)의 기운이 강하게 나타나며, 이는 두 사람 간의 근본적인 성격 차이와 가치관 충돌을 의미합니다. 일상적인 대화에서도 의견 충돌이 빈번하고, 서로를 이해하기 어려운 상황이 지속될 수 있습니다.\n\n경제관념, 가족관계, 자녀교육, 취미, 친구관계 등 삶의 전반적인 영역에서 갈등이 예상되며, 이러한 갈등이 누적되면 관계 파탄으로 이어질 가능성이 높습니다. 단순한 애정만으로는 한계가 있을 수 있습니다.\n\n🔥 솔직한 조언: 이 궁합은 현실적으로 매우 어려운 관계입니다. 만약 진정한 사랑이라면 각별한 노력과 전문가의 도움이 반드시 필요합니다. 하지만 무리하게 관계를 유지하려 하기보다는 신중한 판단이 필요할 수 있습니다.`;
        }
        
        return details;
    }
    
    /**
     * 오행 관계 상세 설명
     */
    getElementRelationshipDescription(maleElement, femaleElement, relationship) {
        const elementNames = {
            '木': '목(木)',
            '火': '화(火)',
            '土': '토(土)',
            '金': '금(金)',
            '水': '수(水)'
        };
        
        const male = elementNames[maleElement] || maleElement;
        const female = elementNames[femaleElement] || femaleElement;
        
        if (relationship === 'generation') {
            return `${male}과 ${female}이 상생(相生) 관계를 이루고 있습니다.`;
        } else if (relationship === 'conflict') {
            return `${male}과 ${female}이 상극(相剋) 관계를 보이고 있습니다.`;
        } else if (relationship === 'same') {
            return `${male}과 ${female}이 동일한 오행으로 비견(比肩) 관계입니다.`;
        } else {
            return `${male}과 ${female}이 중성적인 관계를 형성하고 있습니다.`;
        }
    }
    
    /**
     * 주(柱)별 관계 설명
     */
    getRelationshipDescription(relationship, pillarName) {
        const descriptions = {
            'generation': `${pillarName}에서도 상생의 기운이 흐르고 있어`,
            'conflict': `${pillarName}에서는 다소 충돌의 기운이 있으나`,
            'same': `${pillarName}에서 같은 오행이 만나`,
            'neutral': `${pillarName}에서는 중립적인 기운이 흐르며`
        };
        
        return descriptions[relationship] || `${pillarName}의 기운은`;
    }
    
    /**
     * 시간 정보 부족 시 안내 메시지 생성
     */
    getTimeInfoNote(timeRel, maleName, femaleName) {
        if (timeRel === 'unknown') {
            // 시간 정보가 없는 경우의 안내
            return `\n⚠️ 참고사항: ${maleName}님 또는 ${femaleName}님의 출생 시간 정보가 없어 정확한 자녀운 분석이 어려운 점이 있습니다. 사주팔자에서 시주(時柱)는 자녀운과 직결되는 중요한 요소로, 정확한 출생 시간을 알면 더욱 정밀한 분석이 가능합니다. 현재는 일주, 월주, 연주 기반으로 분석된 결과입니다.`;
        }
        return '';
    }
}

// 전역 인스턴스 생성
const sajuAnalyzer = new SajuAnalyzer();

// 전역 window 객체에도 노출 (브라우저 환경에서 안전성 확보)
if (typeof window !== 'undefined') {
    window.sajuAnalyzer = sajuAnalyzer;
}

// 디버깅용 로그
console.log('SajuAnalyzer 모듈 로드 완료:', sajuAnalyzer);

