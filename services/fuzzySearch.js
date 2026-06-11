import Fuse from 'fuse.js';
import mongoose from 'mongoose';
import Doubt from '../models/doubtsModel.js';

let fuse = null;
let doubtsCache = [];
let isReady = false;

const FUSE_CONFIG = {
  keys: ['title'],
  threshold: 0.5,
  distance: 100,
  minMatchCharLength: 3,
  includeScore: true,
  shouldSort: true,
  findAllMatches: false,
  ignoreLocation: true,
};

const buildIndex = async () => {
  try {
    const count = await Doubt.countDocuments();
    doubtsCache = await Doubt.find(
      {},
      { title: 1, collegeId: 1, departmentId: 1, _id: 1 }
    ).lean();

    fuse = new Fuse(doubtsCache, FUSE_CONFIG);
    isReady = true;
  } catch (err) {
    isReady = false;
  }
};

const toId = (val) => (val && typeof val === 'object' ? val.toString() : String(val));

export const suggest = (query, filters = {}) => {
  if (!isReady || !fuse) return null;
  if (!query || query.trim().length < 3) return null;

  const results = fuse.search(query);

  if (results.length === 0) return null;

  const cid = filters.collegeId ? toId(filters.collegeId) : null;
  const did = filters.departmentId ? toId(filters.departmentId) : null;

  let best = null;
  for (const r of results) {
    const item = r.item;
    if (cid && (!item.collegeId || toId(item.collegeId) !== cid)) continue;
    if (did && (!item.departmentId || toId(item.departmentId) !== did)) continue;
    best = r;
    break;
  }

  if (!best) return null;
  if (best.score > 0.6) return null;

  return {
    original: query,
    corrected: best.item.title,
  };
};

export const rebuildIndex = async () => {
  isReady = false;
  await buildIndex();
};

mongoose.connection.once('open', buildIndex);
