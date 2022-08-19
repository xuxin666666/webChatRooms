// 调度任务，每interval检查任务，把符合条件的任务添加到定时器中
class Schedule {
    task: {
        [key: number]: {
            callback: Function,
            endDate: number,
            timer?: NodeJS.Timer
        }
    }
    index: number
    interval: number

    constructor() {
        this.task = {}
        this.index = 0
        // 每12个小时检查一次
        this.interval = 1000 * 60 * 60 * 12

        setInterval(() => {
            for(let key in this.task) {
                // 已经定时了就跳过
                if(this.task[key].timer) continue

                if(this.task[key].endDate < Date.now() + this.interval) {
                    this.task[key].timer = setTimeout(() => {
                        this.task[key].callback()
                        delete this.task[key]
                    }, Date.now() + this.interval - this.task[key].endDate)
                } else {
                    // 未定时的任务减少相应的时间
                    this.task[key].endDate -= this.interval
                }
            }
        }, this.interval)
    }

    addTask(callback: Function, delay: number) {
        // 添加到任务中
        this.task[++this.index] = {
            callback,
            endDate: Date.now() + delay
        }

        // 小于interval，直接定时
        if(delay < this.interval) {
            this.task[this.index].timer = setTimeout(() => {
                callback()
                delete this.task[this.index]
            }, delay)
        }

        return this.index
    }

    cancleTask(index: number) {
        clearTimeout(this.task[index].timer)
        delete this.task[index]
    }
}

const schedule = new Schedule()

export default schedule