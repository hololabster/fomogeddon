import { create } from "zustand";

const useGameStore = create((set, get) => {
  // 타이머 참조를 저장할 변수 생성
  let notificationTimer = null;
  
  return {
    // 상태
    selectedScenario: null,
    notification: null,

    // 액션
    setSelectedScenario: (scenario) => {
      // console.log("Setting selected scenario in store:", scenario);
      set({ selectedScenario: scenario });
    },
    
    setNotification: (message) => {
      // 기존 타이머가 있으면 제거
      if (notificationTimer) {
        clearTimeout(notificationTimer);
        notificationTimer = null;
      }
      
      // 알림 설정
      set({ notification: message });
      
      // 새 타이머 등록 (3초 후 알림 제거)
      notificationTimer = setTimeout(() => {
        set({ notification: null });
        notificationTimer = null;
      }, message.time || 4000);
    },
    
    clearNotification: () => {
      // 타이머가 있으면 제거
      if (notificationTimer) {
        clearTimeout(notificationTimer);
        notificationTimer = null;
      }
      
      // 알림 제거
      set({ notification: null });
    }
  };
});

export default useGameStore;