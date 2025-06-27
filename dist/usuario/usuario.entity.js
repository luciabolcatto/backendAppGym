var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Collection, Entity, OneToMany, Property, Cascade, } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Contrato } from '../contrato/contrato.entity.js';
let Usuario = class Usuario extends BaseEntity {
    constructor() {
        super(...arguments);
        this.contratos = new Collection(this);
    }
};
__decorate([
    Property({ nullable: false }),
    __metadata("design:type", String)
], Usuario.prototype, "nombre", void 0);
__decorate([
    Property({ nullable: false }),
    __metadata("design:type", String)
], Usuario.prototype, "apellido", void 0);
__decorate([
    Property({ nullable: false }),
    __metadata("design:type", Number)
], Usuario.prototype, "tel", void 0);
__decorate([
    Property({ nullable: false }),
    __metadata("design:type", String)
], Usuario.prototype, "mail", void 0);
__decorate([
    OneToMany(() => Contrato, (contrato) => contrato.usuario, { cascade: [Cascade.ALL], }),
    __metadata("design:type", Object)
], Usuario.prototype, "contratos", void 0);
Usuario = __decorate([
    Entity()
], Usuario);
export { Usuario };
//# sourceMappingURL=usuario.entity.js.map