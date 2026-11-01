// Protects against NoSQL injection and trims text.
// Removes keys that start with "$" or contain "." (e.g. {"$gt": ""}) from body, query and params.
function clean(value) {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    const result = {};
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      result[key] = clean(value[key]);
    }
    return result;
  }
  return typeof value === 'string' ? value.trim() : value;
}

module.exports = (req, res, next) => {
  if (req.body) req.body = clean(req.body);
  if (req.params) req.params = clean(req.params);
  if (req.query) {
    const cleaned = clean(req.query);
    // req.query may be read-only in some Express versions, so modify it in place
    Object.keys(req.query).forEach((k) => delete req.query[k]);
    Object.assign(req.query, cleaned);
  }
  next();
};
