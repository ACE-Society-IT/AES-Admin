import { BaseController } from './BaseController.js';
import { unifiedConfig } from '../config/unifiedConfig.js';
import {
  adminAuthSchema,
  adminRoundSchema,
  adminPhaseSchema,
  adminStockSchema,
  adminCrisisSchema,
  adminCreateTeamSchema
} from '../validators/gameValidators.js';

export class AdminController extends BaseController {
  constructor(gameEngineService) {
    super();
    this.gameEngineService = gameEngineService;
  }

  verifyPasskey(passkey) {
    if (!this.gameEngineService.isValidAdminPasskey(passkey)) {
      const err = new Error('Invalid Admin Passkey.');
      err.statusCode = 401;
      throw err;
    }
  }

  login(req, res) {
    try {
      const { passkey } = adminAuthSchema.parse(req.body);
      this.verifyPasskey(passkey);
      this.handleSuccess(res, { authenticated: true, gameState: this.gameEngineService.getPublicPayload() });
    } catch (error) {
      this.handleError(error, res, 'adminLogin');
    }
  }

  switchRound(req, res) {
    try {
      const { passkey, round } = adminRoundSchema.parse({
        ...req.body,
        round: Number(req.body.round)
      });
      this.verifyPasskey(passkey);
      const nextState = this.gameEngineService.switchRound(round);
      this.handleSuccess(res, nextState);
    } catch (error) {
      this.handleError(error, res, 'switchRound');
    }
  }

  controlPhase(req, res) {
    try {
      const parsed = adminPhaseSchema.parse({
        ...req.body,
        customSeconds: req.body.customSeconds ? Number(req.body.customSeconds) : undefined
      });
      this.verifyPasskey(parsed.passkey);
      const nextState = this.gameEngineService.handleAdminAction(parsed);
      this.handleSuccess(res, nextState);
    } catch (error) {
      this.handleError(error, res, 'controlPhase');
    }
  }

  addStock(req, res) {
    try {
      const parsed = adminStockSchema.parse({
        ...req.body,
        round: Number(req.body.round || 1),
        basePrice: Number(req.body.basePrice)
      });
      this.verifyPasskey(parsed.passkey);
      const nextState = this.gameEngineService.addStock(parsed);
      this.handleSuccess(res, nextState);
    } catch (error) {
      this.handleError(error, res, 'addStock');
    }
  }

  removeStock(req, res) {
    try {
      const { passkey, symbol } = req.body;
      this.verifyPasskey(passkey);
      if (!symbol) throw new Error('Stock symbol is required');
      const nextState = this.gameEngineService.removeStock(symbol);
      this.handleSuccess(res, nextState);
    } catch (error) {
      this.handleError(error, res, 'removeStock');
    }
  }

  updateStockPrice(req, res) {
    try {
      const passkey = req.body.passkey || req.body.passcode;
      this.verifyPasskey(passkey);
      const { symbol, newPrice } = req.body;
      if (!symbol) throw new Error('Stock symbol is required');
      if (newPrice === undefined || isNaN(Number(newPrice)) || Number(newPrice) <= 0) {
        throw new Error('A valid positive new price is required');
      }
      const nextState = this.gameEngineService.updateStockPrice({ symbol, newPrice: Number(newPrice) });
      this.handleSuccess(res, nextState);
    } catch (error) {
      this.handleError(error, res, 'updateStockPrice');
    }
  }

  toggleStockHalt(req, res) {
    try {
      const passkey = req.body.passkey || req.body.passcode;
      this.verifyPasskey(passkey);
      const { symbol } = req.body;
      if (!symbol) throw new Error('Stock symbol is required');
      const result = this.gameEngineService.toggleStockCircuitBreaker(symbol);
      this.handleSuccess(res, result);
    } catch (error) {
      this.handleError(error, res, 'toggleStockHalt');
    }
  }

  addCrisis(req, res) {
    try {
      const parsed = adminCrisisSchema.parse({
        ...req.body,
        round: Number(req.body.round),
        crisisNumber: Number(req.body.crisisNumber)
      });
      this.verifyPasskey(parsed.passkey);
      const nextState = this.gameEngineService.addOrUpdateCrisis(parsed);
      this.handleSuccess(res, nextState);
    } catch (error) {
      this.handleError(error, res, 'addCrisis');
    }
  }

  removeCrisis(req, res) {
    try {
      const { passkey, round, crisisNumber } = req.body;
      this.verifyPasskey(passkey);
      const nextState = this.gameEngineService.removeCrisis({ round: Number(round), crisisNumber: Number(crisisNumber) });
      this.handleSuccess(res, nextState);
    } catch (error) {
      this.handleError(error, res, 'removeCrisis');
    }
  }

  getTaxHavens(req, res) {
    try {
      const passkey = req.query.passkey || req.headers['x-admin-passkey'];
      this.verifyPasskey(passkey);
      const havens = this.gameEngineService.getAdminTaxHavens();
      this.handleSuccess(res, { havens });
    } catch (error) {
      this.handleError(error, res, 'getTaxHavens');
    }
  }

  updateTaxHaven(req, res) {
    try {
      const { passkey, channelId, safeLimit, taxRatePercent, penaltyRatePercent } = req.body;
      this.verifyPasskey(passkey);
      const updated = this.gameEngineService.updateTaxHaven({
        channelId: Number(channelId),
        safeLimit: safeLimit !== undefined ? Number(safeLimit) : undefined,
        taxRatePercent: taxRatePercent !== undefined ? Number(taxRatePercent) : undefined,
        penaltyRatePercent: penaltyRatePercent !== undefined ? Number(penaltyRatePercent) : undefined
      });
      this.handleSuccess(res, { updated, havens: this.gameEngineService.getAdminTaxHavens() });
    } catch (error) {
      this.handleError(error, res, 'updateTaxHaven');
    }
  }

  updateRoundSettings(req, res) {
    try {
      const passkey = req.body.passkey || req.body.passcode;
      this.verifyPasskey(passkey);
      const { roundSettings } = req.body;
      if (!roundSettings) throw new Error('roundSettings object is required');
      const updated = this.gameEngineService.updateRoundSettings(roundSettings);
      this.handleSuccess(res, { roundSettings: updated });
    } catch (error) {
      this.handleError(error, res, 'updateRoundSettings');
    }
  }

  saveDraftCrisis(req, res) {
    try {
      const passkey = req.body.passkey || req.body.passcode;
      this.verifyPasskey(passkey);
      const { draft } = req.body;
      if (!draft || !draft.headline) throw new Error('Valid draft object is required');
      const saved = this.gameEngineService.saveDraftCrisis(draft);
      this.handleSuccess(res, { draft: saved, draftCrises: this.gameEngineService.getPublicPayload().draftCrises });
    } catch (error) {
      this.handleError(error, res, 'saveDraftCrisis');
    }
  }

  deleteDraftCrisis(req, res) {
    try {
      const passkey = req.body.passkey || req.body.passcode;
      this.verifyPasskey(passkey);
      const { draftId } = req.body;
      if (!draftId) throw new Error('draftId is required');
      this.gameEngineService.deleteDraftCrisis(draftId);
      this.handleSuccess(res, { draftCrises: this.gameEngineService.getPublicPayload().draftCrises });
    } catch (error) {
      this.handleError(error, res, 'deleteDraftCrisis');
    }
  }

  publishDraftCrisis(req, res) {
    try {
      const passkey = req.body.passkey || req.body.passcode;
      this.verifyPasskey(passkey);
      const { draftId, targetRound, triggerImmediately } = req.body;
      if (!draftId) throw new Error('draftId is required');
      const nextState = this.gameEngineService.publishDraftCrisis({
        draftId,
        targetRound,
        triggerImmediately: Boolean(triggerImmediately)
      });
      this.handleSuccess(res, nextState);
    } catch (error) {
      this.handleError(error, res, 'publishDraftCrisis');
    }
  }

  createTeam(req, res) {
    try {
      const parsed = adminCreateTeamSchema.parse(req.body);
      this.verifyPasskey(parsed.passkey);
      const created = this.gameEngineService.createTeam({
        name: parsed.name,
        teamPasscode: parsed.teamPasscode,
        initialBudget: parsed.initialBudget
      });
      this.handleSuccess(res, { created });
    } catch (error) {
      this.handleError(error, res, 'createTeam');
    }
  }

  resetTeamPasscode(req, res) {
    try {
      const passkey = req.body.passkey || req.body.passcode;
      this.verifyPasskey(passkey);
      const { teamId, passcode, newPasscode } = req.body;
      const targetPasscode = newPasscode || passcode;
      if (!teamId || !targetPasscode) throw new Error('teamId and new passcode are required');
      const updated = this.gameEngineService.resetTeamPasscode({ teamId, passcode: targetPasscode });
      this.handleSuccess(res, { updated });
    } catch (error) {
      this.handleError(error, res, 'resetTeamPasscode');
    }
  }

  updateTeamName(req, res) {
    try {
      const passkey = req.body.passkey || req.body.passcode;
      this.verifyPasskey(passkey);
      const { teamId, newName, name } = req.body;
      const targetName = newName || name;
      if (!teamId || !targetName) throw new Error('teamId and new team name are required');
      const updated = this.gameEngineService.updateTeamName({ teamId, newName: targetName });
      this.handleSuccess(res, { updated });
    } catch (error) {
      this.handleError(error, res, 'updateTeamName');
    }
  }

  toggleTeamBan(req, res) {
    try {
      const passkey = req.body.passkey || req.body.passcode;
      this.verifyPasskey(passkey);
      const { teamId, isBanned } = req.body;
      if (!teamId) throw new Error('teamId is required');
      const updated = this.gameEngineService.toggleTeamBan({ teamId, isBanned });
      this.handleSuccess(res, { updated });
    } catch (error) {
      this.handleError(error, res, 'toggleTeamBan');
    }
  }

  deleteTeam(req, res) {
    try {
      const passkey = req.body.passkey || req.body.passcode;
      this.verifyPasskey(passkey);
      const { teamId } = req.body;
      if (!teamId) throw new Error('teamId is required');
      const result = this.gameEngineService.deleteTeam(teamId);
      this.handleSuccess(res, result);
    } catch (error) {
      this.handleError(error, res, 'deleteTeam');
    }
  }

  updateTeamBudget(req, res) {
    try {
      const passkey = req.body.passkey || req.body.passcode;
      this.verifyPasskey(passkey);
      const { teamId, initialBudget, cash } = req.body;
      if (!teamId) throw new Error('teamId is required');
      const updated = this.gameEngineService.updateTeamBudget({ teamId, initialBudget, cash });
      this.handleSuccess(res, { updated });
    } catch (error) {
      this.handleError(error, res, 'updateTeamBudget');
    }
  }

  updateAllTeamsBudget(req, res) {
    try {
      const passkey = req.body.passkey || req.body.passcode;
      this.verifyPasskey(passkey);
      const { initialBudget, cash } = req.body;
      const result = this.gameEngineService.updateAllTeamsBudget({ initialBudget, cash });
      this.handleSuccess(res, result);
    } catch (error) {
      this.handleError(error, res, 'updateAllTeamsBudget');
    }
  }

  toggleGlobalLogins(req, res) {
    try {
      const passkey = req.body.passkey || req.body.passcode;
      this.verifyPasskey(passkey);
      const { loginsEnabled } = req.body;
      const result = this.gameEngineService.toggleGlobalLogins(loginsEnabled);
      this.handleSuccess(res, result);
    } catch (error) {
      this.handleError(error, res, 'toggleGlobalLogins');
    }
  }

  getAdminOverview(req, res) {
    try {
      const passkey = req.query.passkey || req.headers['x-admin-passkey'];
      this.verifyPasskey(passkey);
      const overview = this.gameEngineService.getAdminOverview();
      this.handleSuccess(res, overview);
    } catch (error) {
      this.handleError(error, res, 'getAdminOverview');
    }
  }

  createPasskey(req, res) {
    try {
      const passkey = req.body.passkey || req.body.passcode;
      this.verifyPasskey(passkey);
      const { newPasskey, label } = req.body;
      const passkeys = this.gameEngineService.createAdminPasskey({ passkey: newPasskey, label });
      this.handleSuccess(res, { passkeys });
    } catch (error) {
      this.handleError(error, res, 'createPasskey');
    }
  }

  deletePasskey(req, res) {
    try {
      const passkey = req.body.passkey || req.body.passcode;
      this.verifyPasskey(passkey);
      const { keyToDelete } = req.body;
      const passkeys = this.gameEngineService.deleteAdminPasskey(keyToDelete);
      this.handleSuccess(res, { passkeys });
    } catch (error) {
      this.handleError(error, res, 'deletePasskey');
    }
  }
}
