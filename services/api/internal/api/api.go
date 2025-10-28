package api

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/ArronJLinton/fucci-api/internal/ai"
	"github.com/ArronJLinton/fucci-api/internal/auth"
	"github.com/ArronJLinton/fucci-api/internal/cache"
	"github.com/ArronJLinton/fucci-api/internal/database"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
)

// InitJWT initializes JWT authentication with the provided secret
func InitJWT(secret string) error {
	return auth.InitJWTAuth(secret)
}

type Config struct {
	DB                 *database.Queries
	DBConn             *sql.DB
	FootballAPIKey     string
	RapidAPIKey        string
	Cache              cache.CacheInterface
	APIFootballBaseURL string
	OpenAIKey          string
	OpenAIBaseURL      string
	AIPromptGenerator  *ai.PromptGenerator
}

func New(c Config) http.Handler {
	router := chi.NewRouter()

	// Initialize AI prompt generator if OpenAI key is provided
	if c.OpenAIKey != "" {
		c.AIPromptGenerator = ai.NewPromptGenerator(c.OpenAIKey, c.OpenAIBaseURL, c.Cache)
	}

	// Initialize services
	teamsService := NewTeamsService(c.DB)
	teamManagersService := NewTeamManagersService(c.DB)
	leaguesService := NewLeaguesService(c.DB)
	playerProfilesService := &PlayerProfileService{DB: c.DB}
	verificationsService := &VerificationService{DB: c.DB, PlayerProfileSvc: &PlayerProfileService{DB: c.DB}}

	// Health check routes
	router.Get("/health", HandleReadiness)
	router.Get("/health/redis", c.HandleRedisHealth)
	router.Get("/health/cache-stats", c.HandleCacheStats)

	// Auth routes (no authentication required)
	authRouter := chi.NewRouter()
	authRouter.Post("/register", c.handleCreateUser)
	authRouter.Post("/login", c.handleLogin)

	// User routes (authentication required)
	userRouter := chi.NewRouter()
	userRouter.Use(auth.RequireAuth)
	userRouter.Get("/profile", c.handleGetProfile)
	userRouter.Put("/profile", c.handleUpdateProfile)

	// Temp route for listing all users
	userRouter.Get("/all", c.handleListAllUsers)

	futbolRouter := chi.NewRouter()
	futbolRouter.Get("/matches", c.getMatches)
	futbolRouter.Get("/lineup", c.getMatchLineup)
	futbolRouter.Get("/leagues", c.getLeagues)
	futbolRouter.Get("/team_standings", c.getLeagueStandingsByTeamId)
	futbolRouter.Get("/league_standings", c.getLeagueStandingsByLeagueId)

	googleRouter := chi.NewRouter()
	googleRouter.Get("/search", c.search)

	debateRouter := chi.NewRouter()
	debateRouter.Post("/", c.createDebate)
	debateRouter.Get("/top", c.getTopDebates)
	debateRouter.Get("/generate", c.generateAIPrompt)
	debateRouter.Post("/generate", c.generateDebate)
	debateRouter.Get("/health", c.checkDebateGenerationHealth)
	debateRouter.Get("/match", c.getDebatesByMatch)
	debateRouter.Get("/{id}", c.getDebate)
	debateRouter.Post("/cards", c.createDebateCard)
	debateRouter.Post("/votes", c.createVote)
	debateRouter.Post("/comments", c.createComment)
	debateRouter.Get("/{debateId}/comments", c.getComments)
	// Admin routes for soft delete management
	debateRouter.Delete("/{id}/hard", c.hardDeleteDebate) // Permanent deletion
	debateRouter.Post("/{id}/restore", c.restoreDebate)   // Restore soft-deleted debate

	// Teams routes
	teamsRouter := chi.NewRouter()
	teamsRouter.Post("/", teamsService.CreateTeam)
	teamsRouter.Get("/", teamsService.ListTeams)
	teamsRouter.Get("/{id}", teamsService.GetTeam)
	teamsRouter.Put("/{id}", teamsService.UpdateTeam)
	teamsRouter.Delete("/{id}", teamsService.DeleteTeam)
	teamsRouter.Get("/{id}/stats", teamsService.GetTeamStats)

	// Team Managers routes
	teamManagersRouter := chi.NewRouter()
	teamManagersRouter.Post("/", teamManagersService.CreateTeamManager)
	teamManagersRouter.Get("/", teamManagersService.ListTeamManagers)
	teamManagersRouter.Get("/{id}", teamManagersService.GetTeamManager)
	teamManagersRouter.Put("/{id}", teamManagersService.UpdateTeamManager)
	teamManagersRouter.Delete("/{id}", teamManagersService.DeleteTeamManager)
	teamManagersRouter.Get("/{id}/stats", teamManagersService.GetManagerStats)

	// Leagues routes
	leaguesRouter := chi.NewRouter()
	leaguesRouter.Post("/", leaguesService.CreateLeague)
	leaguesRouter.Get("/", leaguesService.ListLeagues)
	leaguesRouter.Get("/{id}", leaguesService.GetLeague)
	leaguesRouter.Put("/{id}", leaguesService.UpdateLeague)
	leaguesRouter.Delete("/{id}", leaguesService.DeleteLeague)
	leaguesRouter.Get("/{id}/stats", leaguesService.GetLeagueStats)

	// Player Profiles routes
	playerProfilesRouter := chi.NewRouter()
	playerProfilesRouter.Post("/", playerProfilesService.CreatePlayerProfile)
	playerProfilesRouter.Get("/{id}", playerProfilesService.GetPlayerProfile)
	playerProfilesRouter.Put("/{id}", playerProfilesService.UpdatePlayerProfile)
	playerProfilesRouter.Delete("/{id}", playerProfilesService.DeletePlayerProfile)

	// Verifications routes
	verificationsRouter := chi.NewRouter()
	verificationsRouter.Post("/", verificationsService.AddVerification)
	verificationsRouter.Delete("/{id}", verificationsService.RemoveVerification)
	verificationsRouter.Get("/player/{playerId}", verificationsService.ListVerifications)

	router.Mount("/auth", authRouter)
	router.Mount("/users", userRouter)
	router.Mount("/futbol", futbolRouter)
	router.Mount("/google", googleRouter)
	router.Mount("/debates", debateRouter)
	router.Mount("/teams", teamsRouter)
	router.Mount("/team-managers", teamManagersRouter)
	router.Mount("/leagues", leaguesRouter)
	router.Mount("/player-profiles", playerProfilesRouter)
	router.Mount("/verifications", verificationsRouter)

	return router
}

// getUserIDFromContext extracts user ID from request context (set by auth middleware)
func getUserIDFromContext(r *http.Request) uuid.UUID {
	userID, ok := r.Context().Value("user_id").(int32)
	if !ok {
		// Return default UUID if no user ID in context (for backward compatibility)
		return uuid.MustParse("00000000-0000-0000-0000-000000000001")
	}
	// Convert int32 to UUID by creating a zero-padded UUID
	return uuid.MustParse(fmt.Sprintf("00000000-0000-0000-0000-%012d", userID))
}
