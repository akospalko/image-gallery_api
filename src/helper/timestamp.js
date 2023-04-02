  // generate timestamp, return string (yyyy.mm.dd hh:mm:ss)
  const timestamp = (separatorDate='.', separatorTime=':') => {
    const today = new Date(); 
    // date
    const year = today.getFullYear();
    let month = (today.getMonth() + 1) < 10 ? (`0${today.getMonth()}`) : (`${today.getMonth()}`); 
    let day = today.getDate() < 10 ? (`0${today.getDate()}`) : (`${today.getDate()}`);
    const date = `${year}${separatorDate}${month}${separatorDate}${day}${separatorDate}` 
    // time
    const time = `${today.getHours()}${separatorTime}${today.getMinutes()}${separatorTime}${today.getSeconds()}`;

    return date +' '+ time;
  }

  module.exports = timestamp;
