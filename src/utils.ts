export type Entity = Record<string, any>;
export type TextFragment = [string, SequenceFocus];
export type SequenceFocus = {
  start: number;
  end: number;
};

export const isStringRel = (entity: Entity, prop: string): boolean => {
  return typeof entity[prop] === "string";
};

export const isArrayRel = (entity: Entity, prop: string): boolean => {
  return Array.isArray(entity[prop]);
};

export const isFlatArrayRel = (entity: Entity, prop: string): boolean => {
  return Array.isArray(entity[prop]) && entity[prop].length > 0 &&
    !Array.isArray(entity[prop][0]);
};

export const isPairlistRel = (entity: Entity, prop: string): boolean => {
  return Array.isArray(entity[prop]) && entity[prop].length > 0 &&
    Array.isArray(entity[prop][0]);
};

export const removeEmpty = (entity: Entity): Entity => {
  for (const rel of Object.keys(entity)) {
    if (isArrayRel(entity, rel) && entity[rel].length === 0) {
      delete entity[rel];
    }
  }

  return entity;
};

// horrible
export const mapRelationship = (entity: Entity, rel: string, fns: any) => {
  if (!entity[rel]) {
    return entity;
  }

  if (isStringRel(entity, rel) && fns.onString) {
    entity[rel] = fns.onString(entity[rel]);
  }
  if (isFlatArrayRel(entity, rel) && fns.onFlatArray) {
    entity[rel] = fns.onFlatArray(entity[rel]);
  }
  if (isPairlistRel(entity, rel) && fns.onPairArray) {
    entity[rel] = fns.onPairArray(entity[rel]);
  }

  return entity;
};

export const mapEntity = (entity: Entity, rel: string, fn: any) => {
  const tgts = entity[rel];

  if (typeof tgts === "string") {
    entity[rel] = fn([tgts])[0];
  }
};

export interface RewriteRules {
  rules(text: TextFragment): TextFragment;
}
