module.exports = (req, res, next) => {
  res.success = (data, message = 'Success') => {
    res.json({ code: 200, message, data });
  };
  
  res.error = (message = 'Error', code = 500) => {
    res.json({ code, message, data: null });
  };
  next();
};
