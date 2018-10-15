import graphApi from '../../api/graphApi';
import dataseriesApi from '../../api/dataseriesApi';
import selectorApi from '../../api/selectorApi';

const state = {
  graphs: [],
  counters: []
};

const findGraphById = (id) => state.graphs.find((graph) => graph._id === id);

// getters
const getters = {
  all: (state) => {
    return state.graphs;
  },
  allByIds: (state) => (graphIds) => {
    return state.graphs;
  },
  getByGraphById: (state) => findGraphById,
  getCountersByDataseriesId: (state) => (id) => {
    return state.counters.find((counter) => counter._id === id);
  }
};

// actions
const actions = {
  async getAllGraphs({commit}) {
    const graphs = await graphApi.getAllGraphs();
    commit('addGraphs', graphs);
  },
  async getAllDashboardGraphs({commit}, dashboardId) {
    const graphs = await graphApi.getAllDashboardGraphs(dashboardId);
    commit('addGraphs', graphs);
  },
  async deleteGraph({state, commit}, graphId) {
    await graphApi.deleteGraph(graphId);
    commit('deleteGraph', graphId);
  },
  async createGraph({commit}, graphId) {
    const newGraph = await graphApi.createGraph(graphId);
    commit('addGraph', newGraph);
    return newGraph;
  },
  async getGraphDataseries ({ commit }, graphId) {
    const graphDataseries = await graphApi.getGraphDataseries(graphId);
    commit('setGraphDataseries', graphDataseries);
  },
  async deleteGraphDataseries ({ state, commit }, dataseriesId) {
    await dataseriesApi.deleteDataseries(dataseriesId);
    // TODO delete dataseries mapping
    commit('deleteDataseries', dataseriesId);
  },
  async createGraphDataseries ({ commit }, {graphId, dataseries}) {
    const newDataseries = await dataseriesApi.createDataseries(dataseries);
    const newGraphDataseriesMapping = await graphApi.addDataseriesToGraph(graphId, dataseries);
    commit('createGraphDataseries', {graphId, newDataseries});
  },
  async addSelectorToDataseries({ commit }, {dataseriesId, selector}) {
    const newSelector = selectorApi.createSelector(selector);
    const selectorDataseriesMapping = await dataseriesApi.addSelectorToDataseries(dataseriesId, newSelector._id);
    commit('addSelectorToDataseries', {dataseriesId, newSelector});
  },
  async removeSelectorFromDataseries({ commit }, {dataseriesId, selectorId}) {
    const selectorDataseriesMapping = await dataseriesApi.removeSelectorFromDataseries(dataseriesId, selectorId);
    const deleted = selectorApi.deleteSelector(selectorId);
    commit('addSelectorToDataseries', selectorDataseriesMapping);
  }
};

const mutations = {
  addGraphs(state, graphs) {
    state.graphs = graphs;
  },
  deleteGraph(state, graphId) {
    const start = state.graphs.findIndex((graph) => {
      return graph._id === graphId;
    });
    state.graphs.splice(
      start, 1
    );
  },
  addGraph(state, graph) {
    state.graphs.push(graph);
  },
  setGraphDataseries(state, graph) {
    state.graphs.push(graph);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};