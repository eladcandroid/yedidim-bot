/* eslint-disable global-require */
const categoriesImage = {
  Starting: require('images/case0.jpg'),
  FlatTire: require('images/case1.jpg'),
  NotIdentified1: require('images/case2.jpg'),
  LockedCar: require('images/case3.jpg'),
  OilWaterFuel: require('images/case4.jpg'),
  Extraction: require('images/case5.jpg'),
  NotIdentified2: require('images/case6.jpg'),
  NotIdentified3: require('images/case7.jpg'),
  Other: require('images/case8.jpg'),
  SlammedDoor: require('images/case9.jpg')
}
/* eslint-enable */
export default Object.values(categoriesImage)

export const categoryImg = categoryId =>
  categoriesImage[categoryId]
    ? categoriesImage[categoryId]
    : categoriesImage.Other
