interface Alarm {
  alarmName: string,
  alarmTime: string
}

export const props = {
  name: 'alarms'
}

export const submit = (prev = [], alarm) => {
  const alarms = [
    ...prev,
    alarm
  ]

  return alarms
}

export const acknowledge = ({ getSubmittedData }): string => {
  const value = getSubmittedData()
  return `Your ${value.alarmName} alarm is added!`
}
