import Creeper from "../Creeper"

export default class MineralHarvester extends Creeper {
  run(): void {
    let self = this
    let creep = this.creep
    let creepMemory = this.memory['creeps'][creep.name]
    switch (creepMemory.task) {
      case 'harvesting': {
        let source:any = Game.getObjectById(creepMemory.source)

         // Locate placed container next to energy source
        if (!('position' in creepMemory)) {
          let container = source.pos.findClosestByPath(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } })
          if (container == null || source.pos.getRangeTo(container) > 1) { container = source.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, { filter: { structureType: STRUCTURE_CONTAINER } }) }
          if (container && source.pos.getRangeTo(container) == 1) {
            creepMemory.position = {}
            creepMemory.position.x = container.pos.x
            creepMemory.position.y = container.pos.y
            creepMemory.position.name = container.pos.roomName
          }
        }

        if ('position' in creepMemory) { 
          const position = new RoomPosition(creepMemory.position.x, creepMemory.position.y, creepMemory.position.name)
          if (creep.pos.x != position.x || creep.pos.y != position.y) {
            self.moveTo(position)
          } else {
            creep.harvest(source)
            if (creep.store.getCapacity(RESOURCE_ENERGY) > 0 && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
              let lab = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_LAB } })
              if (lab) {
                creepMemory.task = 'transporting'
                creepMemory.target = lab.id
              }
            }
          }
        }
        break
      }

      // Transport minerals to lab
      case 'transporting': {
        let target:any = Game.getObjectById(creepMemory.target)
        if (target) {
          if (creep.transfer(target, creepMemory.mineralType as MineralConstant) == ERR_NOT_IN_RANGE) { self.moveTo(target.pos) }
          if (creep.store[creepMemory.mineralType as MineralConstant] == 0) {
            creepMemory.task = 'harvesting'
            creepMemory.target = undefined
          }
        }
        break
      }

      default: {
        creepMemory.task = 'harvesting'
        creepMemory.target = undefined
      }
    }
  }
}
