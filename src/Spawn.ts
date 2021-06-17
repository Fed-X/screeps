import ScreepObject from "ScreepObject"

export default class Spawn extends ScreepObject {
  private spawn: StructureSpawn

  constructor(memory: any, spawn: StructureSpawn) {
    super(memory)
    this.spawn = spawn
  }

  createCreep(): void {
    let memory = this.memory
    let creeps = this.spawn.room.find(FIND_MY_CREEPS)

    if (this.spawn.room.energyAvailable >= 300) {
      let sources = this.spawn.room.find(FIND_SOURCES)
      let upgraders = _.filter(creeps, function(c) { return memory['creeps'][c.name].role == 'upgrader' })
      let constructors = _.filter(creeps, function(c) { return memory['creeps'][c.name].role == 'constructor' })
      let transporters = _.filter(creeps, function(c) { return memory['creeps'][c.name].role == 'transporter' })
      let repairers = _.filter(creeps, function(c) { return memory['creeps'][c.name].role == 'repairer' })
      if (upgraders.length == 0) {
        this.spawnUpgrader()
      } else if (transporters.length < sources.length) {
        this.spawnTransporter()
      } else if (constructors.length < sources.length * 2) {
        this.spawnConstructor()
      } else if (repairers.length < sources.length) {
        this.spawnRepairer()
      }
    }
  }

  spawnCreep(body: BodyPartConstant[], attrs: any): void {
    let memory = this.memory
    let name = attrs.role + '-' + Game.time.toString()
    if (this.spawn.spawnCreep(body, name) == OK) {
      let creep = Game.creeps[name]
      memory['creeps'][name] = {}
      for (const attr in attrs) { memory['creeps'][name][attr] = attrs[attr] }
    }
  }

  spawnUpgrader(): void {
    let source:any
    let body = [MOVE, MOVE, CARRY, CARRY, WORK]
    let controller = this.spawn.room.controller
    if (controller) {
      let target = controller.pos.findClosestByPath(FIND_SOURCES)
      if (target) { source = target.id }
    }
    let attrs = { role: 'upgrader', task: 'harvesting', source: source }
    this.spawnCreep(body, attrs)
  }

  spawnTransporter(): void {
    let body = [MOVE, MOVE, CARRY, CARRY, WORK]
    let memory = this.memory
    let creeps = this.spawn.room.find(FIND_MY_CREEPS)
    let sources = this.spawn.room.find(FIND_SOURCES)
    let transporter_sources:any = _.reject(sources, function(s) { return _.filter(creeps, function(c){ return memory['creeps'][c.name].role == 'transporter' && memory['creeps'][c.name]['source'] == s.id }).length > 2 })
    let transporter_source:any = _.sample(transporter_sources)
    let source = transporter_source.id
    let attrs = { role: 'transporter', task: 'filling', source: source }
    this.spawnCreep(body, attrs)
  }

  spawnConstructor(): void {
    let body = [MOVE, MOVE, CARRY, CARRY, WORK]
    let memory = this.memory
    let creeps = this.spawn.room.find(FIND_MY_CREEPS)
    let sources = this.spawn.room.find(FIND_SOURCES)
    let constructor_sources:any = _.reject(sources, function(s) { return _.filter(creeps, function(c){ return memory['creeps'][c.name].role == 'constructor' && memory['creeps'][c.name]['source'] == s.id }).length > 2 })
    let constructor_source:any = _.sample(constructor_sources)
    let source = constructor_source.id
    let attrs = { role: 'constructor', task: 'harvesting', source: source }
    this.spawnCreep(body, attrs)
  }

  spawnRepairer(): void {
    let body = [MOVE, MOVE, CARRY, CARRY, WORK]
    let memory = this.memory
    let creeps = this.spawn.room.find(FIND_MY_CREEPS)
    let sources = this.spawn.room.find(FIND_SOURCES)
    let repairer_sources:any = _.reject(sources, function(s) { return _.filter(creeps, function(c){ return memory['creeps'][c.name].role == 'repairer' && memory['creeps'][c.name]['source'] == s.id }).length > 2 })
    let repairer_source:any = _.sample(repairer_sources)
    let source = repairer_source.id
    let attrs = { role: 'repairer', task: 'harvesting', source: source }
    this.spawnCreep(body, attrs)
  }
}
