// Fucci API Client
// TypeScript client for the Fucci API

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  User,
  Team,
  Player,
  Match,
  MatchEvent,
  Debate,
  DebateResponse,
  Story,
  Report,
  CreateUserRequest,
  LoginRequest,
  UpdateUserRequest,
  FollowRequest,
  CreateTeamRequest,
  UpdateTeamRequest,
  CreatePlayerRequest,
  CreateDebateResponseRequest,
  VoteRequest,
  CreateStoryRequest,
  CreateReportRequest,
  ListTeamsParams,
  ListMatchesParams,
  ListStoriesParams,
  ListDebateResponsesParams,
  ListReportsParams,
  LoginResponse,
  PaginatedResponse,
  ApiResponse,
  ApiError,
} from '@fucci/api-schema/src/types';

export class FucciApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string, timeout: number = 10000) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.token = null;
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  // Auth endpoints
  async register(userData: CreateUserRequest): Promise<User> {
    const response = await this.client.post<ApiResponse<User>>(
      '/auth/register',
      userData
    );
    return response.data.data;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>(
      '/auth/login',
      credentials
    );
    this.setToken(response.data.token);
    return response.data;
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<ApiResponse<User>>('/users/me');
    return response.data.data;
  }

  async updateUser(userData: UpdateUserRequest): Promise<User> {
    const response = await this.client.put<ApiResponse<User>>(
      '/users/me',
      userData
    );
    return response.data.data;
  }

  async followUser(userId: string, followData: FollowRequest): Promise<void> {
    await this.client.post(`/users/${userId}/follow`, followData);
  }

  async unfollowUser(userId: string, followData: FollowRequest): Promise<void> {
    await this.client.delete(`/users/${userId}/unfollow`, { data: followData });
  }

  // Team endpoints
  async listTeams(params?: ListTeamsParams): Promise<PaginatedResponse<Team>> {
    const response = await this.client.get<PaginatedResponse<Team>>('/teams', {
      params,
    });
    return response.data;
  }

  async getTeam(teamId: string): Promise<Team> {
    const response = await this.client.get<ApiResponse<Team>>(
      `/teams/${teamId}`
    );
    return response.data.data;
  }

  async createTeam(teamData: CreateTeamRequest): Promise<Team> {
    const response = await this.client.post<ApiResponse<Team>>(
      '/teams',
      teamData
    );
    return response.data.data;
  }

  async updateTeam(teamId: string, teamData: UpdateTeamRequest): Promise<Team> {
    const response = await this.client.put<ApiResponse<Team>>(
      `/teams/${teamId}`,
      teamData
    );
    return response.data.data;
  }

  async getTeamPlayers(teamId: string): Promise<Player[]> {
    const response = await this.client.get<Player[]>(
      `/teams/${teamId}/players`
    );
    return response.data;
  }

  async addPlayerToTeam(
    teamId: string,
    playerData: CreatePlayerRequest
  ): Promise<Player> {
    const response = await this.client.post<ApiResponse<Player>>(
      `/teams/${teamId}/players`,
      playerData
    );
    return response.data.data;
  }

  // Match endpoints
  async listMatches(
    params?: ListMatchesParams
  ): Promise<PaginatedResponse<Match>> {
    const response = await this.client.get<PaginatedResponse<Match>>(
      '/matches',
      { params }
    );
    return response.data;
  }

  async getMatch(matchId: string): Promise<Match> {
    const response = await this.client.get<ApiResponse<Match>>(
      `/matches/${matchId}`
    );
    return response.data.data;
  }

  async getMatchEvents(matchId: string): Promise<MatchEvent[]> {
    const response = await this.client.get<MatchEvent[]>(
      `/matches/${matchId}/events`
    );
    return response.data;
  }

  async getMatchDebates(matchId: string): Promise<Debate[]> {
    const response = await this.client.get<Debate[]>(
      `/matches/${matchId}/debates`
    );
    return response.data;
  }

  // Debate endpoints
  async getDebate(debateId: string): Promise<Debate> {
    const response = await this.client.get<ApiResponse<Debate>>(
      `/debates/${debateId}`
    );
    return response.data.data;
  }

  async getDebateResponses(
    debateId: string,
    params?: ListDebateResponsesParams
  ): Promise<PaginatedResponse<DebateResponse>> {
    const response = await this.client.get<PaginatedResponse<DebateResponse>>(
      `/debates/${debateId}/responses`,
      { params }
    );
    return response.data;
  }

  async addDebateResponse(
    debateId: string,
    responseData: CreateDebateResponseRequest
  ): Promise<DebateResponse> {
    const response = await this.client.post<ApiResponse<DebateResponse>>(
      `/debates/${debateId}/responses`,
      responseData
    );
    return response.data.data;
  }

  async voteOnResponse(
    debateId: string,
    responseId: string,
    voteData: VoteRequest
  ): Promise<void> {
    await this.client.post(
      `/debates/${debateId}/responses/${responseId}/vote`,
      voteData
    );
  }

  // Story endpoints
  async listStories(
    params?: ListStoriesParams
  ): Promise<PaginatedResponse<Story>> {
    const response = await this.client.get<PaginatedResponse<Story>>(
      '/stories',
      { params }
    );
    return response.data;
  }

  async getStory(storyId: string): Promise<Story> {
    const response = await this.client.get<ApiResponse<Story>>(
      `/stories/${storyId}`
    );
    return response.data.data;
  }

  async createStory(storyData: CreateStoryRequest): Promise<Story> {
    const response = await this.client.post<ApiResponse<Story>>(
      '/stories',
      storyData
    );
    return response.data.data;
  }

  async recordStoryView(storyId: string): Promise<void> {
    await this.client.post(`/stories/${storyId}/view`);
  }

  // Report endpoints
  async createReport(reportData: CreateReportRequest): Promise<Report> {
    const response = await this.client.post<ApiResponse<Report>>(
      '/reports',
      reportData
    );
    return response.data.data;
  }

  // Admin endpoints
  async verifyTeamManager(
    userId: string,
    teamId: string,
    approved: boolean,
    notes?: string
  ): Promise<void> {
    await this.client.post('/admin/team-managers/verify', {
      user_id: userId,
      team_id: teamId,
      approved,
      notes,
    });
  }

  async listReports(
    params?: ListReportsParams
  ): Promise<PaginatedResponse<Report>> {
    const response = await this.client.get<PaginatedResponse<Report>>(
      '/admin/reports',
      { params }
    );
    return response.data;
  }

  // Utility methods
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get<{
      status: string;
      timestamp: string;
    }>('/health');
    return response.data;
  }

  // Error handling
  isApiError(error: any): error is ApiError {
    return (
      error &&
      typeof error === 'object' &&
      'error' in error &&
      'message' in error
    );
  }

  getErrorMessage(error: any): string {
    if (this.isApiError(error)) {
      return error.message;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }
}

// Factory function to create API client
export function createFucciApiClient(
  baseURL: string,
  timeout?: number
): FucciApiClient {
  return new FucciApiClient(baseURL, timeout);
}

// Default export
export default FucciApiClient;
