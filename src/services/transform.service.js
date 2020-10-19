export class TransformService {
    static fbOdjectToArray(fbData) {
     return Object.keys(fbData).map(key => {
      const item = fbData[key]
      item.id = key
      return item
     })
   }
}