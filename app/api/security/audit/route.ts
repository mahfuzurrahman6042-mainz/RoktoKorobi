import { NextRequest, NextResponse } from 'next/server';
import { securityAuditor, penetrationTester } from '@/lib/security-audit';
import { validateCSRFToken } from '@/lib/security';
import { logger } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  try {
    // Validate CSRF token
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !validateCSRFToken(csrfToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    // Get latest audit results
    const latestAudit = securityAuditor.getLatestAudit();
    const penetrationResults = penetrationTester.getResults();

    return NextResponse.json({
      success: true,
      data: {
        latestAudit,
        penetrationResults,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.logApiError('security-audit', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate CSRF token
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !validateCSRFToken(csrfToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, options } = body;

    switch (action) {
      case 'run-audit':
        // Perform full security audit
        const auditResult = await securityAuditor.performFullAudit();
        
        logger.logApiSuccess('security-audit', {
          action: 'run-audit',
          vulnerabilitiesFound: auditResult.tests.length,
          score: auditResult.score
        });

        return NextResponse.json({
          success: true,
          message: 'Security audit completed',
          data: auditResult
        });

      case 'run-penetration-test':
        if (!options?.baseUrl) {
          return NextResponse.json(
            { error: 'Base URL required for penetration testing' },
            { status: 400 }
          );
        }

        // Perform penetration testing
        const penTestResults = await penetrationTester.performPenetrationTest(options.baseUrl);
        
        logger.logApiSuccess('security-audit', {
          action: 'run-penetration-test',
          baseUrl: options.baseUrl,
          vulnerabilitiesFound: penTestResults.length
        });

        return NextResponse.json({
          success: true,
          message: 'Penetration testing completed',
          data: penTestResults
        });

      case 'clear-results':
        // Clear all security test results
        securityAuditor.clearResults();
        penetrationTester.clearResults();
        
        logger.logApiSuccess('security-audit', {
          action: 'clear-results'
        });

        return NextResponse.json({
          success: true,
          message: 'Security test results cleared'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.logApiError('security-audit', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
