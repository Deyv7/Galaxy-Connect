import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  try {
    // 1. Verifica o token em múltiplos locais com ordem de prioridade
    const tokenSources = [
      req.header('Authorization'),
      req.headers['authorization'],
      req.query.token ? `Bearer ${req.query.token}` : null,
      req.cookies?.authToken ? `Bearer ${req.cookies.authToken}` : null,
      req.signedCookies?.authToken ? `Bearer ${req.signedCookies.authToken}` : null
    ];

    const authHeader = tokenSources.find(source => source !== undefined && source !== null);

    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        error: 'Token de acesso não fornecido',
        code: 'MISSING_TOKEN'
      });
    }

    // 2. Verifica formato do token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'Formato de token inválido. Use: Bearer <token>',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    // 3. Extrai e valida o token
    const token = authHeader.split(' ')[1].trim();
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Token não encontrado no header',
        code: 'EMPTY_TOKEN'
      });
    }

    // 4. Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: false // Garante que verifica expiração
    });
    
    // 5. Adiciona dados do usuário ao request
    req.user = {
      id: decoded.id || decoded.userId, // Compatibilidade com ambos
      email: decoded.email,
      name: decoded.name,
      token // Para uso posterior se necessário
    };

    // 6. Se for uma validação de token, retorna dados básicos
    if (req.path === '/validate-token') {
      return res.json({
        success: true,
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email
        },
        tokenExp: decoded.exp
      });
    }

    next();

  } catch (error) {
    console.error('Erro na autenticação:', error);
    
    // Tratamento específico de erros
    const errorResponse = {
      success: false,
      error: 'Erro de autenticação',
      code: 'AUTH_ERROR'
    };

    if (error.name === 'TokenExpiredError') {
      errorResponse.error = 'Sessão expirada. Faça login novamente.';
      errorResponse.code = 'TOKEN_EXPIRED';
      return res.status(401).json(errorResponse);
    }
    
    if (error.name === 'JsonWebTokenError') {
      errorResponse.error = 'Token inválido ou malformado';
      errorResponse.code = 'INVALID_TOKEN';
      return res.status(401).json(errorResponse);
    }
    
    // Erro genérico
    errorResponse.error = 'Erro durante a autenticação';
    errorResponse.details = process.env.NODE_ENV === 'development' ? error.message : undefined;
    return res.status(500).json(errorResponse);
  }
};

export default authMiddleware;