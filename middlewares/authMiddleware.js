import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  try {
    // 1. Verifica o token em múltiplos locais (com ordem de prioridade)
    const authHeader = req.header('Authorization') || 
                      req.headers['authorization'] ||
                      (req.query.token ? `Bearer ${req.query.token}` : null) ||
                      (req.cookies?.authToken ? `Bearer ${req.cookies.authToken}` : null);

    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        error: 'Token de acesso não fornecido' 
      });
    }

    // 2. Verifica se o token está no formato correto (Bearer token)
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'Formato de token inválido. Use: Bearer <token>' 
      });
    }

    // 3. Extrai o token
    const token = authHeader.split(' ')[1].trim();
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Token não encontrado no header' 
      });
    }

    // 4. Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Adiciona os dados do usuário ao request
    req.user = {
      id: decoded.userId,  // Garante padrão de nomenclatura
      email: decoded.email,
      name: decoded.name
    };

    // 6. Continua para a próxima middleware/rota
    next();

  } catch (error) {
    console.error('Erro na autenticação:', error);
    
    // Tratamento específico para diferentes tipos de erro
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expirado. Faça login novamente.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token inválido' 
      });
    }
    
    // Erro genérico
    return res.status(500).json({ 
      success: false,
      error: 'Erro durante a autenticação' 
    });
  }
};

export default authMiddleware;