import Creeper from "../Creeper"

export default class Attacker extends Creeper {
  run(): void {
    let self = this
    let creep = this.creep
    let creepMemory = this.memory['creeps'][creep.name]
    switch (creepMemory.task) {
      case 'claiming': {
        let target:any = Game.flags[creepMemory.target]
        if (target) {
          if (creep.room.name == target.pos.roomName) {
            if (target.room!.controller!.my) {
              target.remove()
            } else {
              if (creep.claimController(target.room!.controller) == ERR_NOT_IN_RANGE) { creep.moveTo(target.room!.controller!.pos) }
            }
          } else {
            creep.moveTo(target.pos)
          }
        } else {
          creep.suicide()
        }
      }

      default: {
        creepMemory.task = 'claiming'
      }
    }
  }
}
