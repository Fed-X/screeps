// Master class for any wrapped screep object
export default abstract class ScreepObject {
  protected memory: any

  constructor(memory: any) {
    this.memory = memory
  }
}
