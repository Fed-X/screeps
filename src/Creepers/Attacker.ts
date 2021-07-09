import Creeper from "../Creeper"

export default class Attacker extends Creeper {
  run(): void {
    let self = this
    let creep = this.creep
    let creepMemory = this.memory['creeps'][creep.name]
    switch (creepMemory.task) {
      case 'attacking': {
        let flags = _.filter(_.map(Game.flags, flag => flag), flag => flag.color == COLOR_RED && flag.secondaryColor == COLOR_RED)
        if (flags.length > 0) {
          let flag = flags[0]
          if (creep.room.name == flag.pos.roomName) {
            let target:any = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, { filter: c => c.getActiveBodyparts(ATTACK) > 0 })
            if (target == null) { target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS) }
            if (target == null) { target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES) }
            if (target) {
              if (creep.attack(target) == ERR_NOT_IN_RANGE) { creep.moveTo(target) }
            }
          } else {
            creep.moveTo(flag.pos)
          }
        } else {
          creep.suicide()
        }
      }

      default: {
        creepMemory.task = 'attacking'
      }
    }
  }
}
