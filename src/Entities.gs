class Lesson{

  /**
   * @param {Number} number
   * 
   * @param {Homework} homework
   */
  constructor(number, homework){
    this.number = number;
    this.homework = homework;
  }
}

class LessonDay{
  /**
   * @param {Lesson[]} lessons
   * 
   * @param {Date} date
   */
  constructor(date, lessons){
    this.date = date;
    this.lessons = lessons;
  }
}

class HomeworkDay{
  /**
   * @param {Homework[]} homeworks
   * 
   * @param {Date} date
   */
  constructor(date, homeworks){
    this.date = date;
    this.homeworks = homeworks;
  }
}

class Homework{
  /**
   * @param {String} name
   * 
   * @param {String} task
   */
  constructor(name, task){
    this.name = name;
    this.task = task;
  }
}
