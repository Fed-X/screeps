import Creeper from "../Creeper"

export default class Reserver extends Creeper {
  run(): void {
    let self = this
    let creep = this.creep
    let creepMemory = this.memory['creeps'][creep.name]
    switch (creepMemory.task) {
      case 'reserving': {
        let target:any = Game.flags[creepMemory.target]
        if (target) {
          if (creep.room.name == target.pos.roomName) {
            if (creep.reserveController(target.room!.controller) == ERR_NOT_IN_RANGE) { creep.moveTo(target.room!.controller!.pos) }
          } else {
            creep.moveTo(target.pos)
          }
        } else {
          creep.suicide()
        }
      }

      default: {
        creepMemory.task = 'reserving'
      }
    }
  }
}
