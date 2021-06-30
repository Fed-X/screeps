import Creeper from "../Creeper"

export default class Harvester extends Creeper {
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
              let link = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_LINK } })
              if (link && creep.pos.inRangeTo(link, 1)) {
                creep.transfer(link, RESOURCE_ENERGY)
              } else {
                creep.drop(RESOURCE_ENERGY)
              }
            }
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
