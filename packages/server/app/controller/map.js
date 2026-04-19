'use strict';

const Controller = require('egg').Controller;

class MapController extends Controller {
  async index() {
    const { ctx } = this;
    const maps = await ctx.model.Map.findAll({
      attributes: ['id', 'name', 'updatedAt'],
      order: [['updatedAt', 'DESC']],
    });
    ctx.body = maps.map(m => ({
      id: m.id,
      name: m.name,
      updatedAt: m.updatedAt,
    }));
  }

  async show() {
    const { ctx } = this;
    const { id } = ctx.params;
    const map = await ctx.model.Map.findByPk(id);
    if (!map) {
      ctx.status = 404;
      ctx.body = { error: '地图不存在' };
      return;
    }
    ctx.body = JSON.parse(map.data);
  }

  async create() {
    const { ctx } = this;
    const mapData = ctx.request.body;
    await ctx.model.Map.create({
      id: mapData.id,
      name: mapData.name,
      description: mapData.description,
      version: mapData.version || 1,
      data: JSON.stringify(mapData),
    });
    ctx.status = 201;
    ctx.body = { id: mapData.id };
  }

  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const mapData = ctx.request.body;
    const map = await ctx.model.Map.findByPk(id);
    if (!map) {
      ctx.status = 404;
      ctx.body = { error: '地图不存在' };
      return;
    }
    await map.update({
      name: mapData.name,
      description: mapData.description,
      version: mapData.version,
      data: JSON.stringify(mapData),
    });
    ctx.body = { success: true };
  }

  async destroy() {
    const { ctx } = this;
    const { id } = ctx.params;
    const map = await ctx.model.Map.findByPk(id);
    if (!map) {
      ctx.status = 404;
      ctx.body = { error: '地图不存在' };
      return;
    }
    await map.destroy();
    ctx.body = { success: true };
  }
}

module.exports = MapController;
