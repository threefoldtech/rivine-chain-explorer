import { API_URL, PRECISION } from '../../common/config'
import axios from 'axios'
import router from '../../router'
import { Response, Parser } from 'rivine-ts-types'

const parser: Parser = new Parser(PRECISION)


const explorer = {
  state: {
    explorer: Object,
    block: Object,
    hash:  Response,
    loading: Boolean(false)
  },
  mutations: {
    SET_EXPLORER: (state: any, explorer: object) => {
      state.explorer = explorer
    },
    SET_BLOCK_HEIGHT: (state: any, block: object) => {
      state.block = block
    },
    SET_HASH: (state: any, hash: Response) => {
      state.hash = hash
    },
    SET_LOADING: (state: any, loading: boolean) => {
      state.loading = loading
    }
  },
  actions: {
    SET_EXPLORER: async (context: any) => {
      await axios({ method: 'GET', url: API_URL + '/explorer' }).then(
        result => {
          context.commit('SET_EXPLORER', result.data)
        },
        error => {
          if (error.response.status === 400) {
            router.push('/notfound')
          }
        }
      )
    },
    SET_BLOCK_HEIGHT: async (context: any, height: Number) => {
      await axios({
        method: 'GET',
        url: API_URL + '/explorer/blocks/' + height
      }).then(
        result => {
          const parsedResponse = parser.ParseBlockResponseJSON(result.data)
          context.commit('SET_BLOCK_HEIGHT', parsedResponse)
        },
        error => {
          if (error.response.status === 400) {
            router.push('/notfound')
          }
        }
      )
    },
    SET_HASH: async (context: any, hash: string) => {
      if (!hash) return
      let parsedResponse
      await context.commit('SET_LOADING', true)
      await axios({
        method: 'GET',
        url: API_URL + '/explorer/hashes/' + hash
      }).then(
        result => {
          switch (result.data.hashtype) {
            case 'blockid':
              parsedResponse = parser.ParseBlockResponseJSON(result.data)
              context.commit('SET_BLOCK_HEIGHT', result.data)
              context.commit('SET_LOADING', false)
              break
            default:
              parsedResponse = parser.ParseHashResponseJSON(result.data, hash)
              context.commit('SET_HASH', parsedResponse)
              context.commit('SET_LOADING', false)
          }
        },
        error => {
          if (error.response.status === 400) {
            router.push('/notfound')
          }
        }
      )
    }
  }
}

export default explorer
