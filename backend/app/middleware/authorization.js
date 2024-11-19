const authorizeTeacher = (req, res, next) => {
    if (req.role !== 'TEACHER') return res.status(403).json({ message: 'Access denied' });
    next();
  };
  
  const authorizeStudent = (req, res, next) => {
    if (req.role !== 'STUDENT') return res.status(403).json({ message: 'Access denied' });
    next();
  };
  
  module.exports = { authorizeTeacher, authorizeStudent };
  