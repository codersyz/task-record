"use strict";
const common_vendor = require("../../common/vendor.js");
const api_task = require("../../api/task.js");
const _sfc_main = {
  data() {
    return {
      currentYear: (/* @__PURE__ */ new Date()).getFullYear(),
      currentMonth: (/* @__PURE__ */ new Date()).getMonth() + 1,
      weekdays: ["日", "一", "二", "三", "四", "五", "六"],
      calendarDays: [],
      checkinData: {},
      selectedDate: null,
      selectedDateCheckins: [],
      monthStats: {
        totalDays: 0,
        continuousDays: 0,
        completionRate: 0
      }
    };
  },
  onLoad() {
    this.loadCalendarData();
  },
  methods: {
    async loadCalendarData() {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const res = await api_task.getMonthlyCalendar(this.currentYear, this.currentMonth);
        if (res.code === 200) {
          this.checkinData = res.data.checkins;
          this.generateCalendar();
          this.calculateMonthStats();
        }
        common_vendor.index.hideLoading();
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/calendar/calendar.vue:115", "加载日历数据失败:", error);
      }
    },
    generateCalendar() {
      const year = this.currentYear;
      const month = this.currentMonth;
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      const daysInMonth = lastDay.getDate();
      const firstDayWeek = firstDay.getDay();
      const days = [];
      const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
      for (let i = firstDayWeek - 1; i >= 0; i--) {
        days.push({
          day: prevMonthLastDay - i,
          isCurrentMonth: false,
          hasCheckin: false
        });
      }
      const today = /* @__PURE__ */ new Date();
      for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
        const isToday = year === today.getFullYear() && month === today.getMonth() + 1 && i === today.getDate();
        days.push({
          day: i,
          date: dateStr,
          isCurrentMonth: true,
          isToday,
          hasCheckin: !!this.checkinData[dateStr]
        });
      }
      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          day: i,
          isCurrentMonth: false,
          hasCheckin: false
        });
      }
      this.calendarDays = days;
    },
    calculateMonthStats() {
      const checkinDates = Object.keys(this.checkinData);
      this.monthStats.totalDays = checkinDates.length;
      const today = /* @__PURE__ */ new Date();
      const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
      let passedDays = daysInMonth;
      if (this.currentYear === today.getFullYear() && this.currentMonth === today.getMonth() + 1) {
        passedDays = today.getDate();
      }
      this.monthStats.completionRate = passedDays > 0 ? Math.round(checkinDates.length / passedDays * 100) : 0;
      this.monthStats.continuousDays = this.calculateContinuousDays(checkinDates);
    },
    calculateContinuousDays(checkinDates) {
      if (checkinDates.length === 0)
        return 0;
      const today = /* @__PURE__ */ new Date();
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      let continuous = 0;
      let checkDate = new Date(today);
      checkDate.setHours(0, 0, 0, 0);
      while (true) {
        const year = checkDate.getFullYear();
        const month = String(checkDate.getMonth() + 1).padStart(2, "0");
        const day = String(checkDate.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;
        if (checkinDates.includes(dateStr)) {
          continuous++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      return continuous;
    },
    selectDate(day) {
      if (!day.isCurrentMonth || !day.hasCheckin) {
        this.selectedDate = null;
        this.selectedDateCheckins = [];
        return;
      }
      this.selectedDate = `${this.currentMonth}月${day.day}日`;
      this.selectedDateCheckins = this.checkinData[day.date] || [];
    },
    prevMonth() {
      if (this.currentMonth === 1) {
        this.currentYear--;
        this.currentMonth = 12;
      } else {
        this.currentMonth--;
      }
      this.selectedDate = null;
      this.selectedDateCheckins = [];
      this.loadCalendarData();
    },
    nextMonth() {
      if (this.currentMonth === 12) {
        this.currentYear++;
        this.currentMonth = 1;
      } else {
        this.currentMonth++;
      }
      this.selectedDate = null;
      this.selectedDateCheckins = [];
      this.loadCalendarData();
    },
    getCategoryName(category) {
      const names = {
        study: "学习",
        sport: "运动",
        read: "阅读",
        health: "健康",
        work: "工作",
        other: "其他"
      };
      return names[category] || "其他";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.prevMonth && $options.prevMonth(...args)),
    b: common_vendor.t($data.currentYear),
    c: common_vendor.t($data.currentMonth),
    d: common_vendor.o((...args) => $options.nextMonth && $options.nextMonth(...args)),
    e: common_vendor.t($data.monthStats.totalDays),
    f: common_vendor.t($data.monthStats.continuousDays),
    g: common_vendor.t($data.monthStats.completionRate),
    h: common_vendor.f($data.weekdays, (day, k0, i0) => {
      return {
        a: common_vendor.t(day),
        b: day
      };
    }),
    i: common_vendor.f($data.calendarDays, (day, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(day.day),
        b: day.hasCheckin
      }, day.hasCheckin ? {} : {}, {
        c: index,
        d: !day.isCurrentMonth ? 1 : "",
        e: day.isToday ? 1 : "",
        f: day.hasCheckin ? 1 : "",
        g: common_vendor.o(($event) => $options.selectDate(day), index)
      });
    }),
    j: $data.selectedDate && $data.selectedDateCheckins.length > 0
  }, $data.selectedDate && $data.selectedDateCheckins.length > 0 ? {
    k: common_vendor.t($data.selectedDate),
    l: common_vendor.f($data.selectedDateCheckins, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t($options.getCategoryName(item.category)),
        b: common_vendor.n("category-" + item.category),
        c: common_vendor.t(item.taskTitle),
        d: item.note
      }, item.note ? {
        e: common_vendor.t(item.note)
      } : {}, {
        f: index
      });
    })
  } : $data.selectedDate ? {
    n: common_vendor.t($data.selectedDate)
  } : {}, {
    m: $data.selectedDate
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6e8913ab"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/calendar/calendar.js.map
